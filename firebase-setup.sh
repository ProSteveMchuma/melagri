#!/bin/bash

# Firebase Setup Script for Melagri E-commerce
# This script helps you complete the Firebase setup

echo "🔥 Firebase Setup Helper"
echo "========================"
echo ""

# Check if logged in
echo "✓ Logged in as: proinnovationtech@gmail.com"
echo "✓ Project: melagri"
echo "✓ Firestore: Created and rules deployed"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. Enable Firebase Storage:"
echo "   Visit: https://console.firebase.google.com/project/melagri/storage"
echo "   Click: 'Get Started'"
echo "   Choose: 'Start in production mode'"
echo "   Select: 'us-central1' (or your preferred region)"
echo "   Click: 'Done'"
echo ""

echo "2. Get Service Account Key:"
echo "   Visit: https://console.firebase.google.com/project/melagri/settings/serviceaccounts"
echo "   Click: 'Generate New Private Key'"
echo "   Click: 'Generate Key'"
echo "   Save file as: /workspaces/melagri/backend/firebase-key.json"
echo ""

echo "3. Once you have the key, run:"
echo "   cd /workspaces/melagri/backend"
echo "   export GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json"
echo "   npm run seed:firebase"
echo ""

echo "4. Deploy Storage Rules (after enabling storage):"
echo "   cd /workspaces/melagri"
echo "   firebase deploy --only storage:rules"
echo ""

echo "🌐 Firebase Console Links:"
echo "   - Overview: https://console.firebase.google.com/project/melagri/overview"
echo "   - Firestore: https://console.firebase.google.com/project/melagri/firestore"
echo "   - Storage: https://console.firebase.google.com/project/melagri/storage"
echo "   - Settings: https://console.firebase.google.com/project/melagri/settings/serviceaccounts"
echo ""

echo "💡 Tip: You can also run the emulators locally for development:"
echo "   firebase emulators:start"
echo ""
