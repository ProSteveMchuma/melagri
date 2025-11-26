/**
 * Firebase Database Seeding Script
 * Populates Firestore with sample product data
 */

const { db } = require('./config/firebase');
const Product = require('./models/ProductFirestore');

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

async function seedDatabase() {
  try {
    console.log('🌱 Starting Firebase database seeding...\n');

    // Clear existing products (optional)
    console.log('📦 Clearing existing products...');
    const snapshot = await db.collection('products').get();
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`✓ Deleted ${snapshot.size} existing products\n`);

    // Add sample products
    console.log('📦 Adding sample products...');
    let successCount = 0;
    let errorCount = 0;

    for (const productData of sampleProducts) {
      try {
        // Use custom ID if provided
        if (productData.id) {
          await db.collection('products').doc(productData.id).set({
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          await Product.create(productData);
        }
        console.log(`✓ Added: ${productData.name}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to add ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Database seeding completed!`);
    console.log(`   Success: ${successCount} products`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} products`);
    }
    console.log(`\n📊 Total products in database: ${successCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
