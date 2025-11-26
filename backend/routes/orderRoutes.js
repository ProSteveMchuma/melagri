const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderControllerFirebase');

// Public route (guest checkout)
router.post('/', createOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/:orderNumber', getOrder);
router.put('/:orderNumber/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:orderNumber/cancel', cancelOrder);

module.exports = router;
