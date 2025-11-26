const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isActive: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort === 'price-asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'price-desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === 'name') {
      productsQuery = productsQuery.sort({ name: 1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Update stock (Admin only)
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock value'
      });
    }

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};
