/**
 * Checkout Page Management
 * Handles checkout form submission and order processing
 */

class Checkout {
    constructor() {
        this.deliveryFee = 500;
        this.init();
    }

    init() {
        // Redirect if cart is empty
        if (!cart || cart.cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            window.location.href = 'products.html';
            return;
        }

        this.renderOrderSummary();
        this.setupFormHandlers();
    }

    renderOrderSummary() {
        const orderItems = document.getElementById('order-items');
        const subtotal = cart.getTotal();
        const total = subtotal + this.deliveryFee;

        if (orderItems) {
            orderItems.innerHTML = cart.cart.map(item => `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
                        <span class="item-qty">${item.quantity}</span>
                    </div>
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.weight || item.volume || item.unit}</p>
                    </div>
                    <div class="order-item-price">
                        <strong>KSh ${(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                </div>
            `).join('');
        }

        // Update summary
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryDelivery = document.getElementById('summary-delivery');
        const summaryTotal = document.getElementById('summary-total');

        if (summarySubtotal) summarySubtotal.textContent = `KSh ${subtotal.toLocaleString()}`;
        if (summaryDelivery) summaryDelivery.textContent = `KSh ${this.deliveryFee.toLocaleString()}`;
        if (summaryTotal) summaryTotal.textContent = `KSh ${total.toLocaleString()}`;
    }

    setupFormHandlers() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder(form);
        });

        // Phone number formatting
        const phoneInput = form.querySelector('input[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('254')) {
                    value = '0' + value.substring(3);
                }
                e.target.value = value;
            });
        }
    }

    async processOrder(form) {
        const formData = new FormData(form);
        const orderData = {
            customer: {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                email: formData.get('email')
            },
            delivery: {
                county: formData.get('county'),
                city: formData.get('city'),
                area: formData.get('area'),
                address: formData.get('address')
            },
            items: cart.cart,
            subtotal: cart.getTotal(),
            deliveryFee: this.deliveryFee,
            total: cart.getTotal() + this.deliveryFee,
            paymentMethod: formData.get('paymentMethod'),
            notes: formData.get('notes'),
            orderDate: new Date().toISOString(),
            orderNumber: this.generateOrderNumber()
        };

        // Disable submit button
        const submitBtn = document.getElementById('place-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        try {
            // Save order to localStorage (in production, send to backend)
            this.saveOrder(orderData);

            // Process payment based on method
            if (orderData.paymentMethod === 'mpesa') {
                await this.processMpesaPayment(orderData);
            } else {
                // Cash on Delivery - go directly to success
                this.redirectToSuccess(orderData);
            }
        } catch (error) {
            console.error('Order processing error:', error);
            alert('There was an error processing your order. Please try again or contact us for assistance.');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
            }
        }
    }

    async processMpesaPayment(orderData) {
        // In production, this would call your M-Pesa API
        // For now, we'll simulate the payment process
        
        const phoneNumber = orderData.customer.phone.replace(/^0/, '254');
        const amount = orderData.total;

        // Show M-Pesa prompt
        const proceed = confirm(
            `M-Pesa Payment\n\n` +
            `Amount: KSh ${amount.toLocaleString()}\n` +
            `Phone: ${orderData.customer.phone}\n\n` +
            `You will receive an M-Pesa prompt on your phone.\n` +
            `Enter your M-Pesa PIN to complete the payment.\n\n` +
            `Click OK to proceed.`
        );

        if (!proceed) {
            throw new Error('Payment cancelled by user');
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, check payment status from backend
        // For demo, we'll assume success
        this.redirectToSuccess(orderData);
    }

    saveOrder(orderData) {
        // Save to localStorage (in production, send to backend API)
        const orders = JSON.parse(localStorage.getItem('makamithi_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('makamithi_orders', JSON.stringify(orders));
    }

    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `MK${timestamp}${random}`;
    }

    redirectToSuccess(orderData) {
        // Store order for success page
        sessionStorage.setItem('last_order', JSON.stringify(orderData));
        
        // Clear cart
        cart.clearCart();
        
        // Redirect to success page
        window.location.href = 'order-success.html';
    }
}

// Initialize checkout
let checkout;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkout = new Checkout();
    });
} else {
    checkout = new Checkout();
}
