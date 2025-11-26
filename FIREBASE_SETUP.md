# Firebase Setup Instructions

## 🎯 Get Started in 3 Steps

### Step 1: Create Firebase Project (5 minutes)

1. Visit: https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `melagri-ecommerce`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Services (2 minutes)

**Enable Firestore:**
1. Left menu → **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select closest region
5. Click **"Enable"**

**Enable Storage:**
1. Left menu → **"Build"** → **"Storage"**
2. Click **"Get started"**
3. Accept default rules
4. Choose same region
5. Click **"Done"**

### Step 3: Get Credentials (3 minutes)

1. Click gear icon ⚙️ → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Save the JSON file to: `/workspaces/melagri/backend/firebase-key.json`
5. Run this command:

```bash
cd /workspaces/melagri/backend
echo 'GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json' >> .env
echo 'FIREBASE_PROJECT_ID=melagri-ecommerce' >> .env
echo 'FIREBASE_STORAGE_BUCKET=melagri-ecommerce.appspot.com' >> .env
```

## 🚀 Run the Application

```bash
cd /workspaces/melagri/backend

# Seed the database
npm run seed:firebase

# Start the server
npm run start:firebase
```

## ✅ Verify It's Working

1. Server should show: `✓ Firebase Firestore connected successfully`
2. Visit: http://localhost:5000
3. Should see: `"database": "Firebase Firestore"`

## 🎨 Frontend (No Changes Needed!)

The frontend will automatically work with Firebase because the API endpoints are identical.

Just make sure the backend is running:
```bash
cd /workspaces/melagri/backend
npm run start:firebase
```

## 🔐 Security Rules (Optional but Recommended)

In Firebase Console, update Firestore rules:

**Firestore Database → Rules tab:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only via backend API
    }
    match /orders/{orderId} {
      allow read, write: if false; // Only via backend API
    }
    match /users/{userId} {
      allow read, write: if false; // Only via backend API
    }
  }
}
```

**Storage → Rules tab:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if false; // Upload via backend only
    }
  }
}
```

## 📱 Test the Full Stack

1. **Start backend:**
   ```bash
   cd /workspaces/melagri/backend
   npm run start:firebase
   ```

2. **Start frontend:**
   ```bash
   cd /workspaces/melagri
   python3 -m http.server 8001
   ```

3. **Visit:** http://localhost:8001

## 🆘 Common Issues

### "Firebase not initialized"
```bash
# Make sure you have the service account key
export GOOGLE_APPLICATION_CREDENTIALS="/workspaces/melagri/backend/firebase-key.json"
npm run start:firebase
```

### "Project not found"
Check that FIREBASE_PROJECT_ID matches your project ID in Firebase Console

### "Permission denied"
Update security rules in Firebase Console to allow backend access

## 💰 Pricing (Don't Worry!)

Firebase Free Tier includes:
- **Firestore:** 50K reads/day, 20K writes/day, 1GB storage
- **Storage:** 5GB storage, 1GB/day download
- **Functions:** 125K invocations/month

Perfect for development and small-scale production! 🎉

## 🔄 Switch Back to MongoDB

If you need to use MongoDB instead:
```bash
npm start
# or
node server.js
```

Both work simultaneously! You can keep MongoDB for local dev and Firebase for production.

## 📚 Learn More

- 📖 Full Guide: [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md)
- ⚡ Quick Reference: [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md)
- 🔥 Firebase Docs: https://firebase.google.com/docs

---

**Need help?** Check the detailed guides or Firebase documentation!
