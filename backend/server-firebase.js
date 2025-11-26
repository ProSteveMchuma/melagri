const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase
const { db } = require('./config/firebase');

// Import routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Verify Firebase connection
if (db) {
  console.log('✓ Firebase Firestore connected successfully');
} else {
  console.error('❌ Firebase Firestore connection failed');
  console.log('⚠️ Please configure Firebase credentials in .env');
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Melagri E-commerce API',
    version: '2.0.0',
    database: 'Firebase Firestore',
    status: 'running'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8001'}`);
  console.log(`✓ Database: Firebase Firestore`);
});
