const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Animal Feeds', 'Fertilizers', 'Seeds', 'Crop Protection', 'Veterinary']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/assets/images/placeholder.jpg'
  },
  unit: {
    type: String,
    default: 'bag'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
