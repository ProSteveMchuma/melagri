const express = require('express');
const router = express.Router();
const {
  initiateMpesaPayment,
  mpesaCallback,
  queryPaymentStatus,
  confirmCODOrder
} = require('../controllers/paymentController');

// M-Pesa routes
router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);
router.get('/mpesa/status/:checkoutRequestId', queryPaymentStatus);

// COD confirmation
router.post('/cod/confirm', confirmCODOrder);

module.exports = router;
