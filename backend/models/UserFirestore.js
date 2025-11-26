/**
 * User Model - Firestore Version
 * Handles user data operations in Firestore
 */

const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const usersCollection = db.collection('users');

class User {
    // Create a new user
    static async create(userData) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const docRef = await usersCollection.add({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: hashedPassword,
            role: userData.role || 'customer',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        const doc = await docRef.get();
        const user = { id: doc.id, ...doc.data() };
        delete user.password; // Don't return password
        return user;
    }

    // Find user by email
    static async findByEmail(email) {
        const snapshot = await usersCollection
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    // Find user by ID
    static async findById(id) {
        const doc = await usersCollection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const user = { id: doc.id, ...doc.data() };
        delete user.password; // Don't return password
        return user;
    }

    // Get all users
    static async findAll(filters = {}) {
        let query = usersCollection;

        if (filters.role) {
            query = query.where('role', '==', filters.role);
        }
        if (filters.isActive !== undefined) {
            query = query.where('isActive', '==', filters.isActive);
        }

        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const user = { id: doc.id, ...doc.data() };
            delete user.password;
            return user;
        });
    }

    // Update user
    static async update(id, updates) {
        // Don't allow password update through this method
        const { password, ...safeUpdates } = updates;

        await usersCollection.doc(id).update({
            ...safeUpdates,
            updatedAt: new Date()
        });
        
        return await User.findById(id);
    }

    // Update password
    static async updatePassword(id, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await usersCollection.doc(id).update({
            password: hashedPassword,
            updatedAt: new Date()
        });

        return await User.findById(id);
    }

    // Verify password
    static async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }

    // Delete user (soft delete)
    static async delete(id) {
        await usersCollection.doc(id).update({
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date()
        });
        return { id };
    }

    // Hard delete user
    static async hardDelete(id) {
        await usersCollection.doc(id).delete();
        return { id };
    }
}

module.exports = User;
