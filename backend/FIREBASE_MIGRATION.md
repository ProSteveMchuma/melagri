# Firebase Migration Guide

This guide helps you migrate from MongoDB to Firebase Firestore and Cloud Storage.

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `melagri-ecommerce`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll configure rules later)
4. Select your region (closest to your users)
5. Click "Enable"

### Step 3: Enable Cloud Storage

1. Go to "Build" → "Storage"
2. Click "Get started"
3. Use default security rules
4. Choose the same region as Firestore
5. Click "Done"

### Step 4: Get Firebase Credentials

#### For Development (Local Testing):

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely
5. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

#### For Production (Recommended):

1. Copy the entire service account JSON content
2. In your `.env` file, set:
   ```
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...",...}'
   ```

### Step 5: Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Read for all, write for authenticated admins
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Orders: Read/write for authenticated users (own orders only)
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         resource.data.customer.userId == request.auth.uid);
    }
    
    // Users: Read own profile, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 6: Configure Storage Security Rules

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // User uploads
    match /uploads/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
cd /workspaces/melagri/backend
npm install firebase-admin
```

### 2. Configure Environment Variables

Copy `.env.firebase` to `.env` and update with your Firebase credentials:

```bash
cp .env.firebase .env
```

Edit `.env` and set:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your storage bucket (usually `project-id.appspot.com`)
- `FIREBASE_SERVICE_ACCOUNT`: Your service account JSON (for production)

### 3. Update Controllers and Routes

The Firebase versions are already created. To use them, update your route files:

**routes/productRoutes.js**:
```javascript
// Change this:
const controller = require('../controllers/productController');
// To this:
const controller = require('../controllers/productControllerFirebase');
```

**routes/orderRoutes.js**:
```javascript
const controller = require('../controllers/orderControllerFirebase');
```

**routes/userRoutes.js**:
```javascript
const controller = require('../controllers/userControllerFirebase');
```

### 4. Seed the Database

```bash
cd /workspaces/melagri/backend
node seed-firebase.js
```

### 5. Start the Server

```bash
# Use the Firebase server
node server-firebase.js

# Or update package.json to use it by default:
# "start": "node server-firebase.js"
```

## 🔄 Migration from MongoDB

### Migrate Existing Data

If you have existing data in MongoDB, create a migration script:

```javascript
// migrate-to-firebase.js
const mongoose = require('mongoose');
const { db } = require('./config/firebase');
const MongoProduct = require('./models/Product'); // MongoDB model

async function migrate() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Get all products from MongoDB
  const products = await MongoProduct.find({});
  
  // Add to Firestore
  for (const product of products) {
    await db.collection('products').doc(product.id).set({
      name: product.name,
      category: product.category,
      price: product.price,
      // ... other fields
      createdAt: product.createdAt,
      updatedAt: new Date()
    });
    console.log(`Migrated: ${product.name}`);
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

migrate();
```

## 🎨 Frontend Updates

No changes needed! The API endpoints remain the same. The frontend will work seamlessly with Firebase.

## 📊 Firebase Advantages

1. **Scalability**: Auto-scales with your app growth
2. **Real-time**: Get real-time updates with listeners
3. **Offline Support**: Built-in offline data persistence
4. **Security**: Granular security rules at database level
5. **Integration**: Easy integration with other Firebase services
6. **Storage**: Integrated file storage with Cloud Storage
7. **Free Tier**: Generous free tier for development

## 🔐 Create Admin User

After seeding, create an admin user:

```bash
node -e "
const User = require('./models/UserFirestore');
(async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@melagri.com',
    phone: '+254712345678',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Admin user created:', admin);
  process.exit(0);
})();
"
```

## 🚀 Deployment

### Deploy to Firebase Functions (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```

3. Update `functions/index.js`:
   ```javascript
   const functions = require('firebase-functions');
   const app = require('./server-firebase');
   
   exports.api = functions.https.onRequest(app);
   ```

4. Deploy:
   ```bash
   firebase deploy --only functions
   ```

Your API will be available at:
`https://us-central1-your-project-id.cloudfunctions.net/api`

## 📝 Next Steps

1. ✅ Set up Firebase project
2. ✅ Configure Firestore and Storage
3. ✅ Update environment variables
4. ✅ Seed database with products
5. ✅ Create admin user
6. ✅ Test API endpoints
7. ⬜ Deploy to Firebase Functions
8. ⬜ Update frontend API URL (if deploying)

## 🆘 Troubleshooting

### Error: "Firebase not initialized"
- Check that GOOGLE_APPLICATION_CREDENTIALS is set
- Or ensure FIREBASE_SERVICE_ACCOUNT is in .env

### Error: "Permission denied"
- Update Firestore security rules
- Ensure user has proper authentication token

### Error: "Storage bucket not found"
- Enable Cloud Storage in Firebase Console
- Update FIREBASE_STORAGE_BUCKET in .env

## 📚 Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
