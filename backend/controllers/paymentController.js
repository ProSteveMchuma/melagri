const Order = require('../models/Order');
const mpesaService = require('../utils/mpesa');

// Initiate M-Pesa payment
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { orderNumber, phone, amount } = req.body;

    // Validate inputs
    if (!orderNumber || !phone || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order number, phone, and amount are required'
      });
    }

    // Find order
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if already paid
    if (order.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Initiate STK push
    const result = await mpesaService.initiateSTKPush(
      phone,
      amount,
      orderNumber,
      `Payment for order ${orderNumber}`
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to initiate M-Pesa payment'
      });
    }

    // Update order with checkout request ID
    order.payment.transactionId = result.data.CheckoutRequestID;
    await order.save();

    res.json({
      success: true,
      message: 'M-Pesa STK push sent. Please check your phone',
      data: {
        checkoutRequestId: result.data.CheckoutRequestID,
        merchantRequestId: result.data.MerchantRequestID
      }
    });
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating M-Pesa payment',
      error: error.message
    });
  }
};

// M-Pesa callback handler
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data'
      });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    // Find order by checkout request ID
    const order = await Order.findOne({ 'payment.transactionId': CheckoutRequestID });

    if (!order) {
      console.error('Order not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment was successful
    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber, phoneNumber, amount;

      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(item => {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          }
          if (item.Name === 'PhoneNumber') {
            phoneNumber = item.Value;
          }
          if (item.Name === 'Amount') {
            amount = item.Value;
          }
        });
      }

      order.payment.status = 'completed';
      order.payment.transactionId = mpesaReceiptNumber || CheckoutRequestID;
      order.payment.paidAt = new Date();
      order.status = 'confirmed';

      await order.save();

      console.log(`Payment successful for order ${order.orderNumber}`);
    } else {
      // Payment failed
      order.payment.status = 'failed';
      await order.save();

      console.log(`Payment failed for order ${order.orderNumber}: ${ResultDesc}`);
    }

    // Always return success to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Still return success to M-Pesa to avoid retries
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  }
};

// Query M-Pesa payment status
exports.queryPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const result = await mpesaService.querySTKStatus(checkoutRequestId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error querying payment status',
      error: error.message
    });
  }
};

// Mark Cash on Delivery order as confirmed
exports.confirmCODOrder = async (req, res) => {
  try {
    const { orderNumber } = req.body;

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payment.method !== 'cod') {
      return res.status(400).json({
        success: false,
        message: 'Order is not Cash on Delivery'
      });
    }

    order.status = 'confirmed';
    order.payment.status = 'pending'; // Will be paid on delivery
    await order.save();

    res.json({
      success: true,
      message: 'COD order confirmed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming COD order',
      error: error.message
    });
  }
};
