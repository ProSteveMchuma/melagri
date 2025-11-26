/**
 * Order Controller - Firebase Version
 */

const Order = require('../models/OrderFirestore');
const Product = require('../models/ProductFirestore');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate stock for all items
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Create order
    const order = await Order.create(orderData);

    // Update stock for each item (if not COD pending)
    if (orderData.payment.method !== 'cod' || orderData.payment.status === 'completed') {
      for (const item of orderData.items) {
        await Product.updateStock(item.productId, -item.quantity);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (userId) filters.userId = userId;

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByOrderNumber(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderNumber } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const statusHistory = [{
      status,
      timestamp: new Date(),
      updatedBy: req.user?.name || 'System'
    }];

    const order = await Order.updateStatus(orderNumber, status, statusHistory);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const { orderNumber } = req.params;

    const order = await Order.cancel(orderNumber, reason);

    // Restore stock if order was confirmed
    if (['confirmed', 'processing'].includes(order.status)) {
      for (const item of order.items) {
        await Product.updateStock(item.productId, item.quantity);
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};
