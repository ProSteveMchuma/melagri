# Melagri E-commerce Platform - Quick Start Guide

Complete e-commerce platform with frontend and backend API.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Docker (optional, for MongoDB)

### 1. Start MongoDB

**Option A: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Local MongoDB**
```bash
# Install MongoDB and start service
sudo systemctl start mongodb
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (MongoDB URI, JWT secret, M-Pesa credentials)

# Seed database with products
node seed.js

# Start server
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend

```bash
# From project root
python3 -m http.server 8001

# Or use any static server
# npx serve -p 8001
```

Open http://localhost:8001 in your browser.

## 📁 Project Structure

```
melagri/
├── backend/                  # Node.js API
│   ├── controllers/          # Request handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth middleware
│   ├── utils/               # M-Pesa integration
│   ├── server.js            # Entry point
│   ├── seed.js              # Database seeder
│   └── API_DOCS.md          # API documentation
├── assets/
│   ├── css/                 # Stylesheets
│   ├── js/                  # Frontend JavaScript
│   │   ├── cart.js          # Shopping cart
│   │   ├── products.js      # Product catalog
│   │   ├── cart-page.js     # Cart management
│   │   └── checkout.js      # Checkout process
│   └── images/              # Static assets
├── data/
│   └── products.json        # Product data (for frontend)
├── index.html               # Homepage
├── products.html            # Product catalog
├── cart.html                # Shopping cart
├── checkout.html            # Checkout page
└── order-success.html       # Order confirmation
```

## 🔑 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Products
- `GET /products` - All products
- `GET /products/:id` - Single product
- `POST /products` - Create (Admin)
- `PUT /products/:id` - Update (Admin)

### Orders
- `POST /orders` - Create order
- `GET /orders` - List orders
- `GET /orders/:orderNumber` - Order details
- `PUT /orders/:orderNumber/status` - Update status (Admin)

### Users
- `POST /users/register` - Register
- `POST /users/login` - Login
- `GET /users/me` - Profile
- `PUT /users/profile` - Update profile

### Payments
- `POST /payments/mpesa/initiate` - M-Pesa payment
- `POST /payments/mpesa/callback` - M-Pesa webhook
- `POST /payments/cod/confirm` - Confirm COD

See **API_DOCS.md** for complete documentation.

## 💳 M-Pesa Integration

### Development (Sandbox)

1. **Get Credentials:**
   - Go to [Safaricom Daraja](https://developer.safaricom.co.ke/)
   - Create app and get Consumer Key & Secret
   - Get Passkey from Test Credentials

2. **Configure .env:**
   ```env
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_ENVIRONMENT=sandbox
   ```

3. **Setup Callback URL:**
   ```bash
   # Use ngrok for local testing
   ngrok http 5000
   
   # Update .env
   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/payments/mpesa/callback
   ```

4. **Test Payment:**
   - Phone: `254708374149`
   - PIN: `1234`

### Production

- Use production credentials
- Set `MPESA_ENVIRONMENT=production`
- Use HTTPS callback URL
- Register URL on Daraja portal

## 🔐 Authentication

### Create Admin User
```bash
# Using MongoDB shell
mongosh melagri

db.users.insertOne({
  name: "Admin",
  email: "admin@melagri.com",
  password: "$2a$10$hashed_password",  # Use bcrypt to hash
  phone: "254712345678",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Login and Get Token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@melagri.com","password":"your_password"}'
```

Use returned token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing

### Test API Endpoints
```bash
cd backend
./test-api.sh
```

### Manual Testing
```bash
# Get products
curl http://localhost:5000/api/products

# Create order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d @test-order.json
```

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=strong_random_secret
   MPESA_ENVIRONMENT=production
   ```

2. **Deploy:**
   ```bash
   # Heroku
   heroku create melagri-api
   git subtree push --prefix backend heroku main
   
   # Railway
   railway up
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Update API URLs** in frontend JS files
2. **Deploy:**
   ```bash
   # Vercel
   vercel deploy
   
   # Netlify
   netlify deploy --prod
   ```

## 📊 Features

✅ **E-commerce Core**
- Product catalog with categories
- Shopping cart with persistence
- Guest checkout
- Order tracking
- Stock management

✅ **Payment Methods**
- M-Pesa STK Push
- Cash on Delivery

✅ **User Management**
- Registration & Login
- JWT Authentication
- User profiles
- Order history

✅ **Admin Features**
- Product management
- Order processing
- Stock updates
- User management

## 🔧 Development

### Backend Development
```bash
cd backend
npm install -g nodemon
npm run dev  # Auto-restart on changes
```

### Frontend Development
- Edit HTML/CSS/JS files
- Refresh browser to see changes
- Use browser DevTools for debugging

## 📝 Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/melagri
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox
FRONTEND_URL=http://localhost:8001
```

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check connection
mongosh mongodb://localhost:27017/melagri
```

**CORS Errors:**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS errors

**M-Pesa Issues:**
- Verify credentials in `.env`
- Check callback URL is publicly accessible
- Review M-Pesa logs in server console

**Port Already in Use:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📚 Resources

- [API Documentation](backend/API_DOCS.md)
- [M-Pesa Daraja Portal](https://developer.safaricom.co.ke/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

ISC

## 👥 Support

For issues or questions, contact: admin@melagri.com
