/**
 * Order Model - Firestore Version
 * Handles order data operations in Firestore
 */

const { db } = require('../config/firebase');

const ordersCollection = db.collection('orders');

class Order {
    // Generate order number
    static generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }

    // Create a new order
    static async create(orderData) {
        const orderNumber = Order.generateOrderNumber();
        
        const docRef = await ordersCollection.add({
            ...orderData,
            orderNumber,
            status: orderData.status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
    }

    // Get all orders with optional filters
    static async findAll(filters = {}) {
        let query = ordersCollection;

        // Apply filters
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.userId) {
            query = query.where('customer.userId', '==', filters.userId);
        }
        if (filters.paymentMethod) {
            query = query.where('payment.method', '==', filters.paymentMethod);
        }

        // Sort by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Get order by order number
    static async findByOrderNumber(orderNumber) {
        const snapshot = await ordersCollection
            .where('orderNumber', '==', orderNumber)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    // Get order by ID
    static async findById(id) {
        const doc = await ordersCollection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    // Update order status
    static async updateStatus(orderNumber, status, statusHistory = []) {
        const order = await Order.findByOrderNumber(orderNumber);
        
        if (!order) {
            throw new Error('Order not found');
        }

        await ordersCollection.doc(order.id).update({
            status,
            statusHistory: [...(order.statusHistory || []), ...statusHistory],
            updatedAt: new Date()
        });

        return await Order.findByOrderNumber(orderNumber);
    }

    // Update payment status
    static async updatePayment(orderNumber, paymentData) {
        const order = await Order.findByOrderNumber(orderNumber);
        
        if (!order) {
            throw new Error('Order not found');
        }

        await ordersCollection.doc(order.id).update({
            'payment.status': paymentData.status,
            'payment.transactionId': paymentData.transactionId,
            'payment.paidAt': paymentData.paidAt || new Date(),
            updatedAt: new Date()
        });

        return await Order.findByOrderNumber(orderNumber);
    }

    // Cancel order
    static async cancel(orderNumber, reason) {
        const order = await Order.findByOrderNumber(orderNumber);
        
        if (!order) {
            throw new Error('Order not found');
        }

        if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            throw new Error(`Cannot cancel order with status: ${order.status}`);
        }

        await ordersCollection.doc(order.id).update({
            status: 'cancelled',
            cancelReason: reason,
            cancelledAt: new Date(),
            updatedAt: new Date()
        });

        return await Order.findByOrderNumber(orderNumber);
    }

    // Delete order
    static async delete(id) {
        await ordersCollection.doc(id).delete();
        return { id };
    }

    // Get order statistics
    static async getStats() {
        const snapshot = await ordersCollection.get();
        const orders = snapshot.docs.map(doc => doc.data());

        const totalOrders = orders.length;
        const totalRevenue = orders
            .filter(o => o.payment.status === 'completed')
            .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        return {
            totalOrders,
            totalRevenue,
            statusCounts
        };
    }
}

module.exports = Order;
