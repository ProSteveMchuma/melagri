const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample products from your existing data
const products = [
  {
    id: 'prod-001',
    name: 'Layers Mash Premium',
    category: 'Animal Feeds',
    price: 3500,
    description: 'Complete feed for layer chickens. Formulated to maximize egg production with optimal nutrition.',
    brand: 'Unga Feeds',
    image: '/assets/products/layers-mash.jpg',
    unit: 'bag',
    stock: 150,
    features: [
      'High protein content',
      'Essential vitamins and minerals',
      'Promotes strong eggshells',
      '70kg bag'
    ]
  },
  {
    id: 'prod-002',
    name: 'Broiler Starter Crumbs',
    category: 'Animal Feeds',
    price: 4200,
    description: 'Specially formulated starter feed for broiler chicks aged 0-21 days.',
    brand: 'Unga Feeds',
    image: '/assets/products/broiler-starter.jpg',
    unit: 'bag',
    stock: 200,
    features: [
      'High energy formula',
      'Supports rapid growth',
      'Easily digestible',
      '50kg bag'
    ]
  },
  {
    id: 'prod-003',
    name: 'Dairy Meal 16%',
    category: 'Animal Feeds',
    price: 3800,
    description: 'Complete dairy feed with 16% protein for lactating cows.',
    brand: 'Unga Feeds',
    image: '/assets/products/dairy-meal.jpg',
    unit: 'bag',
    stock: 120,
    features: [
      '16% crude protein',
      'Increases milk yield',
      'Balanced energy levels',
      '70kg bag'
    ]
  },
  {
    id: 'prod-004',
    name: 'NPK Fertilizer 23:23:0',
    category: 'Fertilizers',
    price: 5500,
    description: 'Balanced NPK fertilizer ideal for cereal crops and general farming.',
    brand: 'Yara',
    image: '/assets/products/npk-fertilizer.jpg',
    unit: 'bag',
    stock: 180,
    features: [
      '23% Nitrogen',
      '23% Phosphorus',
      'Suitable for all soil types',
      '50kg bag'
    ]
  },
  {
    id: 'prod-005',
    name: 'CAN Fertilizer',
    category: 'Fertilizers',
    price: 4800,
    description: 'Calcium Ammonium Nitrate - Top dressing fertilizer for all crops.',
    brand: 'Yara',
    image: '/assets/products/can-fertilizer.jpg',
    unit: 'bag',
    stock: 220,
    features: [
      '26% Nitrogen',
      'Quick acting',
      'Reduces soil acidity',
      '50kg bag'
    ]
  },
  {
    id: 'prod-006',
    name: 'DAP Fertilizer',
    category: 'Fertilizers',
    price: 6200,
    description: 'Di-Ammonium Phosphate - Excellent basal fertilizer for all crops.',
    brand: 'Yara',
    image: '/assets/products/dap-fertilizer.jpg',
    unit: 'bag',
    stock: 160,
    features: [
      '18% Nitrogen',
      '46% Phosphorus',
      'Promotes root growth',
      '50kg bag'
    ]
  },
  {
    id: 'prod-007',
    name: 'Hybrid Maize Seed DK 8031',
    category: 'Seeds',
    price: 3200,
    description: 'High yielding drought-tolerant maize variety suitable for diverse agro-ecological zones.',
    brand: 'DEKALB',
    image: '/assets/products/maize-seed.jpg',
    unit: 'bag',
    stock: 90,
    features: [
      'Drought tolerant',
      'High yield potential',
      'Disease resistant',
      '10kg bag'
    ]
  },
  {
    id: 'prod-008',
    name: 'Bean Seeds KK8',
    category: 'Seeds',
    price: 450,
    description: 'Premium quality red kidney bean seeds with excellent germination rate.',
    brand: 'Kenya Seed Co',
    image: '/assets/products/bean-seed.jpg',
    unit: 'kg',
    stock: 300,
    features: [
      'High germination rate',
      'Disease resistant',
      'Early maturing',
      '1kg pack'
    ]
  },
  {
    id: 'prod-009',
    name: 'Duduthrin 1.6% EC',
    category: 'Crop Protection',
    price: 2800,
    description: 'Broad spectrum insecticide for control of various crop pests.',
    brand: 'Osho Chemicals',
    image: '/assets/products/duduthrin.jpg',
    unit: 'litre',
    stock: 75,
    features: [
      'Broad spectrum control',
      'Contact and stomach action',
      'Effective on aphids, caterpillars',
      '1 litre bottle'
    ]
  },
  {
    id: 'prod-010',
    name: 'Dominus 40WG',
    category: 'Crop Protection',
    price: 1200,
    description: 'Systemic fungicide for control of various fungal diseases in crops.',
    brand: 'Syngenta',
    image: '/assets/products/dominus.jpg',
    unit: 'pack',
    stock: 140,
    features: [
      'Systemic action',
      'Long residual effect',
      'Controls leaf spot, rust',
      '100g pack'
    ]
  },
  {
    id: 'prod-011',
    name: 'Tick Grease',
    category: 'Veterinary',
    price: 650,
    description: 'Effective tick control for livestock. Easy application grease formula.',
    brand: 'Cooper K-Brands',
    image: '/assets/products/tick-grease.jpg',
    unit: 'bottle',
    stock: 200,
    features: [
      'Long-lasting protection',
      'Easy application',
      'Safe for animals',
      '500ml bottle'
    ]
  },
  {
    id: 'prod-012',
    name: 'Albendazole Dewormer',
    category: 'Veterinary',
    price: 850,
    description: 'Broad spectrum dewormer for cattle, sheep, and goats.',
    brand: 'Norbrook',
    image: '/assets/products/dewormer.jpg',
    unit: 'bottle',
    stock: 180,
    features: [
      'Broad spectrum',
      'Effective against roundworms',
      'Single dose treatment',
      '1 litre bottle'
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log(`✓ Seeded ${products.length} products successfully`);

    // Display summary
    const categories = [...new Set(products.map(p => p.category))];
    console.log('\nProduct Summary:');
    categories.forEach(category => {
      const count = products.filter(p => p.category === category).length;
      console.log(`  ${category}: ${count} products`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
