/**
 * Product Model - Firestore Version
 * Handles product data operations in Firestore
 */

const { db } = require('../config/firebase');

const productsCollection = db.collection('products');

class Product {
    // Create a new product
    static async create(productData) {
        const docRef = await productsCollection.add({
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    // Get all products with optional filters
    static async findAll(filters = {}) {
        let query = productsCollection;

        // Apply filters
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        if (filters.inStock !== undefined) {
            query = query.where('stock', '>', 0);
        }
        if (filters.brand) {
            query = query.where('brand', '==', filters.brand);
        }

        // Apply sorting
        if (filters.sort) {
            const [field, direction] = filters.sort.split(':');
            query = query.orderBy(field, direction === 'desc' ? 'desc' : 'asc');
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Get product by ID
    static async findById(id) {
        const doc = await productsCollection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    // Update product
    static async update(id, updates) {
        await productsCollection.doc(id).update({
            ...updates,
            updatedAt: new Date()
        });
        
        return await Product.findById(id);
    }

    // Delete product
    static async delete(id) {
        await productsCollection.doc(id).delete();
        return { id };
    }

    // Update stock
    static async updateStock(id, quantity) {
        const docRef = productsCollection.doc(id);
        const doc = await docRef.get();
        
        if (!doc.exists) {
            throw new Error('Product not found');
        }

        const currentStock = doc.data().stock;
        const newStock = currentStock + quantity;

        if (newStock < 0) {
            throw new Error('Insufficient stock');
        }

        await docRef.update({
            stock: newStock,
            updatedAt: new Date()
        });

        return await Product.findById(id);
    }

    // Search products
    static async search(searchTerm) {
        const snapshot = await productsCollection.get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Client-side search (Firestore doesn't have full-text search)
        const term = searchTerm.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    }
}

module.exports = Product;
