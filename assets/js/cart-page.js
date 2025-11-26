/**
 * Cart Page Management
 * Handles the full cart page display and interactions
 */

class CartPage {
    constructor() {
        this.deliveryFee = 500;
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartItemCount = document.getElementById('cart-item-count');

        if (!cart || cart.cart.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartItemsContainer) cartItemsContainer.style.display = 'none';
            this.updateSummary();
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartItemsContainer) cartItemsContainer.style.display = 'block';
        if (cartItemCount) cartItemCount.textContent = cart.cart.length;

        if (!cartItems) return;

        cartItems.innerHTML = cart.cart.map(item => this.createCartItemHTML(item)).join('');
        this.updateSummary();
    }

    createCartItemHTML(item) {
        const itemTotal = item.price * item.quantity;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='assets/logos/Makamithi Logo.png'"
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-brand"><i class="fas fa-certificate"></i> ${item.brand}</p>
                    <p class="cart-item-meta">${item.weight || item.volume || item.unit}</p>
                    <button class="btn-remove-item" onclick="cartPage.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
                <div class="cart-item-price">
                    <span class="unit-price">KSh ${item.price.toLocaleString()}</span>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="cartPage.updateQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           max="${item.stock}"
                           onchange="cartPage.updateQuantityInput('${item.id}', this.value)">
                    <button class="qty-btn" onclick="cartPage.updateQuantity('${item.id}', ${item.quantity + 1})" ${item.quantity >= item.stock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    <strong>KSh ${itemTotal.toLocaleString()}</strong>
                </div>
            </div>
        `;
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }

        const item = cart.cart.find(i => i.id === productId);
        if (item && newQuantity <= item.stock) {
            cart.updateQuantity(productId, newQuantity);
            this.renderCart();
        } else if (item) {
            this.showNotification(`Maximum available stock is ${item.stock} units`, 'warning');
        }
    }

    updateQuantityInput(productId, value) {
        const quantity = parseInt(value);
        if (!isNaN(quantity) && quantity > 0) {
            this.updateQuantity(productId, quantity);
        }
    }

    removeItem(productId) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            cart.removeFromCart(productId);
            this.renderCart();
        }
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            cart.clearCart();
            this.renderCart();
        }
    }

    updateSummary() {
        const subtotal = cart.getTotal();
        const total = subtotal + (subtotal > 0 ? this.deliveryFee : 0);

        const subtotalElement = document.getElementById('cart-subtotal');
        const deliveryFeeElement = document.getElementById('delivery-fee');
        const totalElement = document.getElementById('cart-total');

        if (subtotalElement) {
            subtotalElement.textContent = `KSh ${subtotal.toLocaleString()}`;
        }

        if (deliveryFeeElement) {
            deliveryFeeElement.textContent = subtotal > 0 ? `KSh ${this.deliveryFee.toLocaleString()}` : 'KSh 0';
        }

        if (totalElement) {
            totalElement.textContent = `KSh ${total.toLocaleString()}`;
        }

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            if (cart.cart.length === 0) {
                checkoutBtn.classList.add('disabled');
                checkoutBtn.style.pointerEvents = 'none';
                checkoutBtn.style.opacity = '0.5';
            } else {
                checkoutBtn.classList.remove('disabled');
                checkoutBtn.style.pointerEvents = 'auto';
                checkoutBtn.style.opacity = '1';
            }
        }
    }

    setupEventListeners() {
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.renderCart();
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
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
}

// Initialize cart page
let cartPage;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cartPage = new CartPage();
    });
} else {
    cartPage = new CartPage();
}
