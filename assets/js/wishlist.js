/**
 * Wishlist Functionality for MELagri
 * Handles adding/removing items and persisting to localStorage.
 */

class WishlistManager {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('melagri_wishlist')) || [];
        this.init();
    }

    init() {
        this.updateWishlistCount();
        this.attachEventListeners();
    }

    add(product) {
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push(product);
            this.save();
            this.updateWishlistCount();
            this.showNotification('Added to wishlist!');
        } else {
            this.showNotification('Already in wishlist!');
        }
    }

    remove(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.save();
        this.updateWishlistCount();
        this.showNotification('Removed from wishlist!');
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    save() {
        localStorage.setItem('melagri_wishlist', JSON.stringify(this.wishlist));
    }

    updateWishlistCount() {
        const countElements = document.querySelectorAll('.wishlist-count');
        countElements.forEach(el => {
            el.textContent = this.wishlist.length;
            el.style.display = this.wishlist.length > 0 ? 'flex' : 'none';
        });
    }

    attachEventListeners() {
        // Delegate click events for wishlist buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-wishlist');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                const productData = JSON.parse(btn.dataset.product);

                if (this.isInWishlist(productData.id)) {
                    this.remove(productData.id);
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="far fa-heart"></i>';
                } else {
                    this.add(productData);
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                }
            }
        });
    }

    showNotification(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'wishlist-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize
const wishlistManager = new WishlistManager();
