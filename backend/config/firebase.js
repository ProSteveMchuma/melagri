/**
 * Firebase Configuration
 * Initialize Firebase Admin SDK for Firestore and Storage
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// For production, use service account credentials
// For development, you can use application default credentials
let firebaseApp;

try {
    // Try to initialize with service account (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    } else {
        // Fallback to default credentials or manual initialization
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    }
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('⚠️ Please set up Firebase credentials in .env file');
}

// Get Firestore instance
const db = admin.firestore();

// Get Storage instance
const bucket = admin.storage().bucket();

// Firestore settings
db.settings({
    ignoreUndefinedProperties: true
});

module.exports = {
    admin,
    db,
    bucket,
    firestore: admin.firestore
};
