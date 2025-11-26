/**
 * Hero Product Slider
 * Handles the dynamic product slider in the hero section.
 */

class HeroSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.promotedProducts = [
            {
                id: 'hero-1',
                name: 'Premium Dairy Meal',
                description: 'Boost milk production with our high-energy dairy meal. Rich in proteins and essential minerals.',
                price: 2500,
                unit: '70kg',
                image: 'assets/images/1.jpeg',
                category: 'animal-feeds',
                badge: 'Best Seller'
            },
            {
                id: 'hero-2',
                name: 'Certified Maize Seeds',
                description: 'Drought-resistant maize varieties for maximum yield. Certified for all ecological zones.',
                price: 650,
                unit: '2kg',
                image: 'assets/images/2.jpeg', // Placeholder, will fallback if missing
                category: 'seeds',
                badge: 'New Arrival'
            },
            {
                id: 'hero-3',
                name: 'DAP Fertilizer',
                description: 'Give your crops the best start with our high-quality DAP fertilizer. Essential for root development.',
                price: 3200,
                unit: '50kg',
                image: 'assets/images/3.jpeg', // Placeholder
                category: 'fertilizers',
                badge: 'Special Offer'
            }
        ];

        this.init();
    }

    init() {
        this.container = document.querySelector('.hero-slider-container');
        if (!this.container) return;

        this.renderSlides();
        this.startAutoPlay();
        this.attachEventListeners();
    }

    renderSlides() {
        const wrapper = document.createElement('div');
        wrapper.className = 'hero-slider-wrapper';

        this.promotedProducts.forEach((product, index) => {
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <div class="hero-slide-content">
                    <div class="slide-badge">${product.badge}</div>
                    <h1 class="slide-title">${product.name}</h1>
                    <p class="slide-description">${product.description}</p>
                    <div class="slide-price">
                        <span class="currency">KSh</span>
                        <span class="amount">${product.price.toLocaleString()}</span>
                        <span class="unit">/ ${product.unit}</span>
                    </div>
                    <div class="slide-actions">
                        <a href="product-details.html?id=${product.id}" class="btn btn-primary">
                            <i class="fas fa-shopping-cart"></i> Shop Now
                        </a>
                        <a href="product-details.html?id=${product.id}" class="btn btn-secondary">
                            View Details
                        </a>
                    </div>
                </div>
                <div class="hero-slide-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/logos/Makamithi Logo.png'">
                </div>
            `;
            wrapper.appendChild(slide);
        });

        // Navigation Controls
        const controls = document.createElement('div');
        controls.className = 'hero-slider-controls';
        controls.innerHTML = `
            <button class="slider-prev"><i class="fas fa-chevron-left"></i></button>
            <div class="slider-dots">
                ${this.promotedProducts.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
            </div>
            <button class="slider-next"><i class="fas fa-chevron-right"></i></button>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(wrapper);
        this.container.appendChild(controls);

        this.slides = this.container.querySelectorAll('.hero-slide');
        this.dots = this.container.querySelectorAll('.dot');
    }

    goToSlide(index) {
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        this.currentSlide = (index + this.slides.length) % this.slides.length;

        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        this.goToSlide(this.currentSlide + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentSlide - 1);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    attachEventListeners() {
        this.container.querySelector('.slider-next').addEventListener('click', () => {
            this.nextSlide();
            this.startAutoPlay(); // Reset timer
        });

        this.container.querySelector('.slider-prev').addEventListener('click', () => {
            this.prevSlide();
            this.startAutoPlay();
        });

        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToSlide(index);
                this.startAutoPlay();
            });
        });

        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
});
