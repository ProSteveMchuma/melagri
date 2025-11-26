# Melagri Backend API

Backend API for the Melagri E-commerce platform with M-Pesa integration.

## Features

- **Product Management**: CRUD operations for products with categories and stock tracking
- **Order Processing**: Complete order management system with status tracking
- **User Authentication**: JWT-based authentication with role-based access control
- **M-Pesa Integration**: Real M-Pesa STK push payment integration
- **Payment Processing**: Support for M-Pesa and Cash on Delivery
- **Admin Dashboard**: Admin-only routes for managing products, orders, and users

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: M-Pesa Daraja API
- **Security**: bcryptjs for password hashing

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- MongoDB connection string
- JWT secret
- M-Pesa credentials (consumer key, secret, shortcode, passkey)
- Email settings (optional)

3. **Start MongoDB**:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

4. **Run the server**:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Products

- `GET /api/products` - Get all products (with filtering, search, sort)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/stock` - Update stock (Admin)

### Orders

- `POST /api/orders` - Create new order (Guest/User)
- `GET /api/orders` - Get all orders (Admin) or user orders (User)
- `GET /api/orders/:orderNumber` - Get single order
- `PUT /api/orders/:orderNumber/status` - Update order status (Admin)
- `PUT /api/orders/:orderNumber/cancel` - Cancel order

### Users

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update password
- `GET /api/users` - Get all users (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Payments

- `POST /api/payments/mpesa/initiate` - Initiate M-Pesa STK push
- `POST /api/payments/mpesa/callback` - M-Pesa callback handler
- `GET /api/payments/mpesa/status/:checkoutRequestId` - Query payment status
- `POST /api/payments/cod/confirm` - Confirm COD order

## M-Pesa Setup

### 1. Get M-Pesa Credentials

1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account and create a new app
3. Get your Consumer Key and Consumer Secret
4. For sandbox testing, use:
   - Shortcode: `174379`
   - Passkey: Get from Daraja portal

### 2. Configure Callback URL

Your callback URL must be publicly accessible. For local development:

1. Use ngrok:
```bash
ngrok http 5000
```

2. Update `.env` with your ngrok URL:
```
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
```

3. Register the callback URL on Daraja portal

### 3. Test Payment

Use sandbox test numbers:
- Phone: `254708374149`
- PIN: `1234`

## Authentication

### Login/Register

```javascript
// Register
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "254712345678"
}

// Login
POST /api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response includes JWT token
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using Protected Routes

Add token to Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

### Product
- id, name, category, price, description, brand, image, unit, stock, features, isActive

### Order
- orderNumber, customer, delivery, items, payment, pricing, status, notes, user

### User
- name, email, password, phone, role, address, isActive

## Error Handling

All API responses follow this format:

```javascript
// Success
{
  "success": true,
  "data": {...}
}

// Error
{
  "success": false,
  "message": "Error message"
}
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes require valid token
- Admin-only routes check user role
- Input validation on all endpoints

## Development

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in dev mode
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use production MongoDB (MongoDB Atlas recommended)
3. Set strong JWT_SECRET
4. Configure production M-Pesa credentials
5. Use proper HTTPS callback URL
6. Deploy to Heroku, DigitalOcean, AWS, etc.

## License

ISC
