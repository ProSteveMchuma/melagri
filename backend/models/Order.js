const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  delivery: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    instructions: String
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['mpesa', 'cod']
    },
    mpesaPhone: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 500
    },
    total: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for searching orders
orderSchema.index({ orderNumber: 1, 'customer.email': 1, 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);
