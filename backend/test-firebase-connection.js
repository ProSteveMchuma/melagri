const path = require('path');
require('dotenv').config();

console.log('🔍 Testing Firebase Connection via App Config...');

try {
    // Import the app's Firebase config
    const { db } = require('./config/firebase');
    const User = require('./models/UserFirestore');

    async function testConnection() {
        try {
            // 1. Test Firestore Write
            console.log('\n📝 Testing Firestore Write...');
            const testDocRef = db.collection('_connection_test').doc('test_doc_config');
            await testDocRef.set({
                timestamp: new Date(),
                message: 'Connection successful via config',
                testedBy: 'Melagri Backend'
            });
            console.log('✅ Firestore Write Successful');

            // 2. Test Firestore Read
            console.log('\n📖 Testing Firestore Read...');
            const doc = await testDocRef.get();
            if (doc.exists) {
                console.log('✅ Firestore Read Successful:', doc.data());
            } else {
                console.error('❌ Firestore Read Failed: Document not found');
            }

            // 3. Test User Model
            console.log('\n👤 Testing User Model...');
            const email = 'test@test.com';

            console.log(`Attempting to create/find user: ${email}`);

            let user = await User.findByEmail(email);
            if (!user) {
                user = await User.create({
                    name: 'Test User',
                    email: email,
                    phone: '1234567890',
                    password: 'test123'
                });
                console.log('✅ User Created Successfully:', user.id);
            } else {
                console.log('ℹ️ User already exists, updating password...');
                await User.updatePassword(user.id, 'test123');
                console.log('✅ Password updated to test123');
            }

            console.log('\n✨ ALL TESTS PASSED!');
            process.exit(0);

        } catch (error) {
            console.error('\n❌ TEST FAILED');
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            if (error.details) console.error('Error Details:', error.details);
            process.exit(1);
        }
    }

    testConnection();

} catch (error) {
    console.error('❌ Initialization Error:', error);
    process.exit(1);
}
