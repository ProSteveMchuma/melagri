# Melagri API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

For protected routes, include JWT token in headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Products API

### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` (optional): Filter by category (Animal Feeds, Fertilizers, Seeds, Crop Protection, Veterinary)
- `search` (optional): Search in name, description, brand
- `sort` (optional): Sort results (price-asc, price-desc, name)

**Example:**
```bash
curl http://localhost:5000/api/products?category=Fertilizers&sort=price-asc
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "prod-001",
      "name": "Layers Mash Premium",
      "category": "Animal Feeds",
      "price": 3500,
      "description": "Complete feed for layer chickens...",
      "brand": "Unga Feeds",
      "image": "/assets/products/layers-mash.jpg",
      "unit": "bag",
      "stock": 150,
      "features": ["High protein content", "..."]
    }
  ]
}
```

### Get Single Product
```http
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:5000/api/products/prod-001
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "id": "prod-013",
  "name": "Product Name",
  "category": "Animal Feeds",
  "price": 2500,
  "description": "Product description",
  "brand": "Brand Name",
  "stock": 100,
  "unit": "bag",
  "features": ["Feature 1", "Feature 2"]
}
```

### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer {admin_token}
```

### Update Stock (Admin Only)
```http
PATCH /api/products/:id/stock
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "stock": 250
}
```

---

## Orders API

### Create Order
```http
POST /api/orders
```

**Request Body:**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "254712345678"
  },
  "delivery": {
    "address": "123 Main Street",
    "city": "Nairobi",
    "region": "Nairobi County",
    "instructions": "Call on arrival"
  },
  "items": [
    {
      "productId": "prod-001",
      "name": "Layers Mash Premium",
      "price": 3500,
      "quantity": 2,
      "subtotal": 7000
    }
  ],
  "payment": {
    "method": "mpesa",
    "mpesaPhone": "254712345678"
  },
  "pricing": {
    "subtotal": 7000,
    "deliveryFee": 500,
    "total": 7500
  },
  "notes": "Deliver morning hours"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "MK1732587123456",
    "status": "pending",
    ...
  }
}
```

### Get Orders
```http
GET /api/orders
Authorization: Bearer {token}
```

Returns all orders for admin, or user's orders for regular users.

### Get Single Order
```http
GET /api/orders/:orderNumber
```

**Example:**
```bash
curl http://localhost:5000/api/orders/MK1732587123456
```

### Update Order Status (Admin Only)
```http
PUT /api/orders/:orderNumber/status
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Status Options:**
- pending
- confirmed
- processing
- shipped
- delivered
- cancelled

### Cancel Order
```http
PUT /api/orders/:orderNumber/cancel
```

---

## Users API

### Register
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/users/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "254712345678",
  "address": {
    "street": "123 Main St",
    "city": "Nairobi",
    "region": "Nairobi County"
  }
}
```

### Update Password
```http
PUT /api/users/password
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer {admin_token}
```

---

## Payments API

### Initiate M-Pesa Payment
```http
POST /api/payments/mpesa/initiate
```

**Request Body:**
```json
{
  "orderNumber": "MK1732587123456",
  "phone": "254712345678",
  "amount": 7500
}
```

**Response:**
```json
{
  "success": true,
  "message": "M-Pesa STK push sent. Please check your phone",
  "data": {
    "checkoutRequestId": "ws_CO_26112024123456789",
    "merchantRequestId": "12345-67890-1"
  }
}
```

### M-Pesa Callback (Webhook)
```http
POST /api/payments/mpesa/callback
```

This endpoint receives callbacks from M-Pesa. Configure this URL in your Daraja portal.

### Query Payment Status
```http
GET /api/payments/mpesa/status/:checkoutRequestId
```

**Example:**
```bash
curl http://localhost:5000/api/payments/mpesa/status/ws_CO_26112024123456789
```

### Confirm COD Order
```http
POST /api/payments/cod/confirm
```

**Request Body:**
```json
{
  "orderNumber": "MK1732587123456"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Testing with cURL

### Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123","phone":"254712345678"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name":"John Doe","email":"john@test.com","phone":"254712345678"},
    "delivery": {"address":"123 Main St","city":"Nairobi","region":"Nairobi"},
    "items": [{"productId":"prod-001","name":"Test Product","price":3500,"quantity":2,"subtotal":7000}],
    "payment": {"method":"cod"},
    "pricing": {"subtotal":7000,"deliveryFee":500,"total":7500}
  }'
```

### Get Products
```bash
# All products
curl http://localhost:5000/api/products

# Filter by category
curl "http://localhost:5000/api/products?category=Fertilizers"

# Search
curl "http://localhost:5000/api/products?search=maize"

# Sort by price
curl "http://localhost:5000/api/products?sort=price-asc"
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production deployment.

## CORS

CORS is enabled for the frontend URL specified in `.env` file. Default: `http://localhost:8001`
