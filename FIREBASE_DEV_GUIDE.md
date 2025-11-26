# Firebase Development Guide

## 🎯 Quick Start with Emulators (Local Development)

### 1. Start Firebase Emulators

```bash
cd /workspaces/melagri
firebase emulators:start
```

This will start:
- 🔥 Firestore Emulator: `localhost:8080`
- 📦 Storage Emulator: `localhost:9199`
- 🔐 Auth Emulator: `localhost:9099`
- 🌐 Hosting: `localhost:5000`
- 🎨 Emulator UI: `http://localhost:4000` (if enabled)

### 2. Seed Emulator Data (In a new terminal)

```bash
cd /workspaces/melagri/backend
npm run seed:emulator
```

This creates:
- ✅ 12 sample products across 5 categories
- ✅ Admin user: `admin@melagri.com` / `admin123`
- ✅ Test customer: `customer@test.com` / `customer123`

### 3. Start Backend Server

```bash
cd /workspaces/melagri/backend
npm run emulator
```

Server runs on: `http://localhost:5000` (API endpoint)

### 4. Open Frontend

```bash
cd /workspaces/melagri
python3 -m http.server 8001
```

Visit: `http://localhost:8001`

---

## 🌐 Production Firebase Setup

### Step 1: Enable Firebase Storage

1. Visit: https://console.firebase.google.com/project/melagri/storage
2. Click "Get Started"
3. Choose "Start in production mode"
4. Select region: `us-central1`
5. Click "Done"

### Step 2: Deploy Storage Rules

```bash
cd /workspaces/melagri
firebase deploy --only storage:rules
```

### Step 3: Get Service Account Key

1. Visit: https://console.firebase.google.com/project/melagri/settings/serviceaccounts
2. Click "Generate New Private Key"
3. Save as: `/workspaces/melagri/backend/firebase-key.json`

### Step 4: Configure Environment

```bash
cd /workspaces/melagri/backend
echo "GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json" >> .env
echo "FIREBASE_PROJECT_ID=melagri" >> .env
echo "FIREBASE_STORAGE_BUCKET=melagri.appspot.com" >> .env
```

### Step 5: Seed Production Database

```bash
npm run seed:firebase
```

### Step 6: Start Production Server

```bash
npm run start:firebase
```

---

## 📝 Available Commands

### Firebase CLI Commands

```bash
# Login to Firebase
firebase login

# List projects
firebase projects:list

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only hosting

# Start emulators
firebase emulators:start

# Run specific emulator
firebase emulators:start --only firestore,storage
```

### Backend Commands

```bash
# MongoDB (original)
npm start                  # Start with MongoDB
npm run dev               # Development mode with nodemon

# Firebase Production
npm run start:firebase    # Start with Firebase
npm run seed:firebase     # Seed Firebase production database

# Firebase Emulator (Local Development)
npm run emulator          # Start backend with emulator
npm run seed:emulator     # Seed emulator with test data
```

---

## 🔧 Configuration Files

### `.firebaserc`
```json
{
  "projects": {
    "default": "melagri"
  }
}
```

### `firebase.json`
Defines Firebase services configuration:
- Firestore rules and indexes
- Storage rules
- Hosting configuration
- Emulator ports

### `firestore.rules`
Security rules for Firestore database:
- Products: Read public, write admin only
- Orders: Read/write own orders, admin full access
- Users: Read/write own profile, admin full access

### `storage.rules`
Security rules for Cloud Storage:
- Product images: Read public, write admin only
- User uploads: Read/write own files only

---

## 🚀 Development Workflow

### Option 1: Local Development with Emulators (Recommended)

**Terminal 1: Start Emulators**
```bash
cd /workspaces/melagri
firebase emulators:start
```

**Terminal 2: Seed Data & Start Backend**
```bash
cd /workspaces/melagri/backend
npm run seed:emulator
npm run emulator
```

**Terminal 3: Start Frontend**
```bash
cd /workspaces/melagri
python3 -m http.server 8001
```

**Benefits:**
- ✅ No internet required after initial setup
- ✅ Free (no Firebase quota usage)
- ✅ Fast reset with `seed:emulator`
- ✅ Safe testing environment
- ✅ Data persists between emulator restarts

### Option 2: Production Firebase

```bash
# Terminal 1: Backend
cd /workspaces/melagri/backend
npm run start:firebase

# Terminal 2: Frontend
cd /workspaces/melagri
python3 -m http.server 8001
```

**When to use:**
- Testing production environment
- Deploying to cloud
- Team collaboration with shared data

---

## 🔐 Test Accounts

### Admin Account
- **Email:** admin@melagri.com
- **Password:** admin123
- **Access:** Full admin dashboard, product management, order management

### Customer Account
- **Email:** customer@test.com
- **Password:** customer123
- **Access:** Browse products, place orders, view order history

---

## 📊 Firebase Console Links

- **Overview:** https://console.firebase.google.com/project/melagri/overview
- **Firestore Database:** https://console.firebase.google.com/project/melagri/firestore
- **Cloud Storage:** https://console.firebase.google.com/project/melagri/storage
- **Authentication:** https://console.firebase.google.com/project/melagri/authentication
- **Project Settings:** https://console.firebase.google.com/project/melagri/settings/general
- **Service Accounts:** https://console.firebase.google.com/project/melagri/settings/serviceaccounts

---

## 🐛 Troubleshooting

### Emulator Connection Error
```bash
# Make sure emulators are running
firebase emulators:start

# Check if ports are available
lsof -i :8080  # Firestore
lsof -i :9199  # Storage
lsof -i :5000  # Backend server
```

### "Permission Denied" Error
- Check firestore.rules and storage.rules
- Redeploy rules: `firebase deploy --only firestore:rules,storage:rules`

### Emulator Data Reset
```bash
# Stop emulators (Ctrl+C)
# Restart emulators
firebase emulators:start

# Re-seed data
npm run seed:emulator
```

### Backend Can't Connect
```bash
# For emulator
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run emulator

# For production
export GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json
npm run start:firebase
```

---

## 💡 Pro Tips

1. **Use Emulators for Development**
   - Faster iteration
   - No quota limits
   - Safe environment

2. **Export/Import Emulator Data**
   ```bash
   # Export
   firebase emulators:export ./emulator-data
   
   # Import on next start
   firebase emulators:start --import=./emulator-data
   ```

3. **View Emulator Data**
   - Enable Emulator UI in firebase.json
   - Visit: http://localhost:4000

4. **Production Deployment**
   ```bash
   # Build and deploy
   firebase deploy --only hosting,firestore:rules,storage:rules
   ```

---

## 📚 Learn More

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/rules)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)
