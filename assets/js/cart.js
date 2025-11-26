/**
 * E-commerce Shopping Cart System
 * Handles cart operations, local storage, and cart UI updates
 */

class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartUI();
        this.attachEventListeners();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('makamithi_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('makamithi_cart', JSON.stringify(this.cart));
        this.updateCartUI();
    }

    // Add item to cart
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`, 'success');
        return true;
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Update cart UI (badge, mini cart, etc.)
    updateCartUI() {
        const itemCount = this.getItemCount();
        const total = this.getTotal();

        // Update cart badge
        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(badge => {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'flex' : 'none';
        });

        // Update mini cart
        this.updateMiniCart();

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { itemCount, total, cart: this.cart }
        }));
    }

    // Update mini cart dropdown
    updateMiniCart() {
        const miniCartItems = document.getElementById('mini-cart-items');
        const miniCartTotal = document.getElementById('mini-cart-total');
        const miniCartEmpty = document.getElementById('mini-cart-empty');

        if (!miniCartItems) return;

        if (this.cart.length === 0) {
            miniCartItems.style.display = 'none';
            if (miniCartEmpty) miniCartEmpty.style.display = 'block';
            if (miniCartTotal) miniCartTotal.textContent = 'KSh 0';
            return;
        }

        if (miniCartEmpty) miniCartEmpty.style.display = 'none';
        miniCartItems.style.display = 'block';

        miniCartItems.innerHTML = this.cart.map(item => `
            <div class="mini-cart-item" data-product-id="${item.id}">
                <div class="mini-cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 font-family=%22Arial%22 font-size=%2212%22 text-anchor=%22middle%22 x=%2250%22 y=%2250%22%3ENo Image%3C/text%3E%3C/svg%3E'"
                </div>
                <div class="mini-cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} × KSh ${item.price.toLocaleString()}</p>
                </div>
                <button class="mini-cart-item-remove" onclick="cart.removeFromCart('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        if (miniCartTotal) {
            miniCartTotal.textContent = `KSh ${this.getTotal().toLocaleString()}`;
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Attach event listeners
    attachEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart-btn');
                const productData = btn.dataset.product;
                
                if (productData) {
                    try {
                        const product = JSON.parse(productData);
                        const quantity = parseInt(btn.dataset.quantity || 1);
                        this.addToCart(product, quantity);
                    } catch (error) {
                        console.error('Error adding to cart:', error);
                        this.showNotification('Error adding item to cart', 'error');
                    }
                }
            }
        });

        // Toggle mini cart
        const cartToggle = document.getElementById('cart-toggle');
        const miniCart = document.getElementById('mini-cart');

        if (cartToggle && miniCart) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                miniCart.classList.toggle('active');
            });

            // Close mini cart when clicking outside
            document.addEventListener('click', (e) => {
                if (!miniCart.contains(e.target) && !cartToggle.contains(e.target)) {
                    miniCart.classList.remove('active');
                }
            });
        }
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}
