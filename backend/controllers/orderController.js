const Order = require('../models/Order');
const Product = require('../models/Product');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { customer, delivery, items, payment, pricing, notes } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`
        });
      }
    }

    // Generate order number
    const orderNumber = `MK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer,
      delivery,
      items,
      payment,
      pricing,
      notes,
      user: req.user ? req.user._id : null
    });

    // Update product stock
    for (const item of items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
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

// Get all orders (Admin) or user's orders
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // If not admin, only show user's orders
    if (req.user && req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

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
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view this order
    if (req.user && req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
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

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      { status },
      { new: true, runValidators: true }
    );

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
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permission
    if (req.user && req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can't cancel shipped or delivered orders
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped or delivered'
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    order.payment.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};
