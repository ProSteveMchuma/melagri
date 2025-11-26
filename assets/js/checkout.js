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
                        <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='assets/logos/Makamithi Logo.png'"
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
        const subtotal = cart.getTotal();
        const total = subtotal + this.deliveryFee;
        
        const orderData = {
            customer: {
                name: formData.get('fullName'),
                phone: formData.get('phone'),
                email: formData.get('email')
            },
            delivery: {
                address: formData.get('address'),
                city: formData.get('city'),
                region: `${formData.get('county')}, ${formData.get('area')}`,
                instructions: formData.get('notes')
            },
            items: cart.cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            payment: {
                method: formData.get('paymentMethod'),
                mpesaPhone: formData.get('paymentMethod') === 'mpesa' ? formData.get('phone') : null
            },
            pricing: {
                subtotal: subtotal,
                deliveryFee: this.deliveryFee,
                total: total
            },
            notes: formData.get('notes')
        };

        // Disable submit button
        const submitBtn = document.getElementById('place-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        try {
            // Create order via API
            const response = await api.createOrder(orderData);
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to create order');
            }

            const order = response.data;

            // Process payment based on method
            if (orderData.payment.method === 'mpesa') {
                await this.processMpesaPayment(order);
            } else {
                // Cash on Delivery - confirm and redirect
                await api.confirmCODOrder(order.orderNumber);
                this.redirectToSuccess(order);
            }
        } catch (error) {
            console.error('Order processing error:', error);
            alert(error.message || 'There was an error processing your order. Please try again.');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
            }
        }
    }

    async processMpesaPayment(order) {
        try {
            const phoneNumber = order.customer.phone.replace(/^0/, '254');
            const amount = order.pricing.total;

            // Show M-Pesa prompt
            const proceed = confirm(
                `M-Pesa Payment\n\n` +
                `Amount: KSh ${amount.toLocaleString()}\n` +
                `Phone: ${order.customer.phone}\n` +
                `Order: ${order.orderNumber}\n\n` +
                `You will receive an M-Pesa prompt on your phone.\n` +
                `Enter your M-Pesa PIN to complete the payment.\n\n` +
                `Click OK to proceed.`
            );

            if (!proceed) {
                throw new Error('Payment cancelled by user');
            }

            // Initiate M-Pesa payment via API
            const paymentResponse = await api.initiateMpesaPayment({
                orderNumber: order.orderNumber,
                phone: phoneNumber,
                amount: amount
            });

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.message || 'Failed to initiate M-Pesa payment');
            }

            // Show waiting message
            alert(
                `M-Pesa STK Push Sent!\n\n` +
                `Check your phone and enter your M-Pesa PIN.\n` +
                `Please wait while we confirm your payment...`
            );

            // Wait for payment confirmation (simulate)
            await new Promise(resolve => setTimeout(resolve, 5000));

            // In production, you would poll the payment status or use webhooks
            // For now, redirect to success page
            this.redirectToSuccess(order);
        } catch (error) {
            throw error;
        }
    }

    saveOrder(orderData) {
        // No longer needed - API handles storage
        // Kept for backward compatibility if needed
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
