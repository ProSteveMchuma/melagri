/**
 * Seed Firebase Emulator with Sample Data
 * Run this after starting the Firebase emulators
 */

// Set emulator environment
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

const admin = require('firebase-admin');

// Initialize Firebase Admin for emulator
admin.initializeApp({
  projectId: 'melagri',
  storageBucket: 'melagri.appspot.com'
});

const db = admin.firestore();

const sampleProducts = [
  {
    id: 'dairy-cow-pellets',
    name: 'Dairy Cow Pellets',
    category: 'Animal Feeds',
    price: 2500,
    description: 'High-quality dairy cow feed pellets for optimal milk production',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50kg bag',
    stock: 150,
    features: ['High protein content', 'Balanced nutrition', 'Enhanced milk production']
  },
  {
    id: 'layer-chicken-mash',
    name: 'Layer Chicken Mash',
    category: 'Animal Feeds',
    price: 1800,
    description: 'Complete feed for laying hens with essential nutrients',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50kg bag',
    stock: 200,
    features: ['Rich in calcium', 'Improved egg production', 'Quality shell formation']
  },
  {
    id: 'npk-fertilizer',
    name: 'NPK 17:17:17 Fertilizer',
    category: 'Fertilizers',
    price: 3200,
    description: 'Balanced NPK fertilizer for all crops',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50kg bag',
    stock: 100,
    features: ['Balanced nutrients', 'Fast-acting formula', 'Suitable for all crops']
  },
  {
    id: 'urea-fertilizer',
    name: 'Urea Fertilizer',
    category: 'Fertilizers',
    price: 2800,
    description: 'High nitrogen content fertilizer for vegetative growth',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50kg bag',
    stock: 120,
    features: ['46% nitrogen', 'Quick release', 'Promotes leaf growth']
  },
  {
    id: 'hybrid-maize-seeds',
    name: 'Hybrid Maize Seeds',
    category: 'Seeds',
    price: 4500,
    description: 'High-yielding hybrid maize seeds',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '10kg pack',
    stock: 80,
    features: ['High yield potential', 'Drought resistant', 'Disease tolerant']
  },
  {
    id: 'vegetable-seeds-pack',
    name: 'Vegetable Seeds Pack',
    category: 'Seeds',
    price: 800,
    description: 'Assorted vegetable seeds for kitchen garden',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: 'Mixed pack',
    stock: 150,
    features: ['Multiple varieties', 'High germination', 'Organic certified']
  },
  {
    id: 'herbicide-glyphosate',
    name: 'Glyphosate Herbicide',
    category: 'Crop Protection',
    price: 1200,
    description: 'Effective broad-spectrum herbicide',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '1 liter',
    stock: 90,
    features: ['Broad-spectrum control', 'Systemic action', 'Quick results']
  },
  {
    id: 'insecticide-lambda',
    name: 'Lambda Insecticide',
    category: 'Crop Protection',
    price: 1500,
    description: 'Powerful insecticide for crop protection',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '1 liter',
    stock: 75,
    features: ['Fast knockdown', 'Long residual', 'Broad pest control']
  },
  {
    id: 'animal-dewomer',
    name: 'Livestock Dewormer',
    category: 'Veterinary',
    price: 2200,
    description: 'Broad-spectrum dewormer for livestock',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '1 liter',
    stock: 60,
    features: ['Broad-spectrum', 'Safe for all ages', 'Easy administration']
  },
  {
    id: 'animal-vaccine',
    name: 'Multi-Disease Vaccine',
    category: 'Veterinary',
    price: 3500,
    description: 'Comprehensive vaccine for livestock protection',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50 doses',
    stock: 45,
    features: ['Multi-disease protection', 'Long immunity', 'Vet recommended']
  },
  {
    id: 'organic-manure',
    name: 'Organic Manure',
    category: 'Fertilizers',
    price: 1500,
    description: 'Well-decomposed organic manure for soil enrichment',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '50kg bag',
    stock: 200,
    features: ['100% organic', 'Improves soil structure', 'Slow release nutrients']
  },
  {
    id: 'poultry-vitamins',
    name: 'Poultry Vitamin Supplement',
    category: 'Veterinary',
    price: 900,
    description: 'Essential vitamins and minerals for poultry health',
    brand: 'Makamithi Premium',
    image: 'assets/logos/Makamithi Logo.png',
    unit: '500ml',
    stock: 110,
    features: ['Complete vitamin mix', 'Boosts immunity', 'Improves growth']
  }
];

async function seedEmulator() {
  try {
    console.log('🌱 Starting Firebase Emulator seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const collections = await db.listCollections();
    for (const collection of collections) {
      const snapshot = await collection.get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`   ✓ Cleared ${collection.id}`);
    }

    // Add sample products
    console.log('\n📦 Adding sample products...');
    const batch = db.batch();
    for (const productData of sampleProducts) {
      const docRef = db.collection('products').doc(productData.id);
      batch.set(docRef, {
        ...productData,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log(`   ✓ Added: ${productData.name}`);
    }
    await batch.commit();

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await db.collection('users').doc('admin-user').set({
      name: 'Admin User',
      email: 'admin@melagri.com',
      phone: '+254712345678',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('   ✓ Admin user created (admin@melagri.com / admin123)');

    // Create test customer
    console.log('\n👤 Creating test customer...');
    const customerPassword = await bcrypt.hash('customer123', salt);
    
    await db.collection('users').doc('test-customer').set({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '+254723456789',
      password: customerPassword,
      role: 'customer',
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log('   ✓ Test customer created (customer@test.com / customer123)');

    console.log('\n✅ Emulator seeding completed!');
    console.log(`   Products: ${sampleProducts.length}`);
    console.log('   Users: 2 (1 admin, 1 customer)');
    console.log('\n🔥 Firebase Emulator UI: http://localhost:4000');
    console.log('   Firestore: http://localhost:8080');
    console.log('   Storage: http://localhost:9199');
    console.log('\n💡 You can now start your backend with:');
    console.log('   cd /workspaces/melagri/backend');
    console.log('   FIRESTORE_EMULATOR_HOST=localhost:8080 node server-firebase.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedEmulator();
