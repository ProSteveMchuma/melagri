/**
 * Component Loader for MELagri Landing Page
 * Dynamically loads HTML components for better maintainability
 */

class ComponentLoader {
    /**
     * Load a single component
     * @param {string} componentName - Name of the component file (without .html)
     * @param {string} targetId - ID of the container element
     */
    static async loadComponent(componentName, targetId) {
        try {
            const response = await fetch(`components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const target = document.getElementById(targetId);
            if (target) {
                target.innerHTML = html;
            } else {
                console.warn(`Target element #${targetId} not found`);
            }
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
        }
    }

    /**
     * Load all components in sequence
     */
    static async loadAll() {
        const components = [
            { name: 'navigation', target: 'nav-container' },
            { name: 'hero', target: 'hero-container' },
            { name: 'categories', target: 'categories-container' },
            { name: 'featured-products', target: 'featured-container' },
            { name: 'services', target: 'services-container' },
            { name: 'partners', target: 'partners-container' },
            { name: 'contact', target: 'contact-container' },
            { name: 'footer', target: 'footer-container' }
        ];

        // Show loading indicator
        document.body.classList.add('components-loading');

        try {
            // Load all components in parallel for better performance
            await Promise.all(
                components.map(c => this.loadComponent(c.name, c.target))
            );

            // Initialize components after loading
            this.initializeComponents();

            // Remove loading indicator
            document.body.classList.remove('components-loading');
        } catch (error) {
            console.error('Error loading components:', error);
            document.body.classList.remove('components-loading');
        }
    }

    /**
     * Initialize JavaScript functionality after components are loaded
     */
    static initializeComponents() {
        // Initialize cart if available
        if (typeof cart !== 'undefined' && cart.init) {
            cart.init();
        }

        // Initialize navigation
        this.initNavigation();

        // Initialize search
        this.initSearch();

        // Dispatch custom event for other scripts
        document.dispatchEvent(new CustomEvent('componentsLoaded'));

        console.log('✅ All components loaded successfully');
    }

    /**
     * Initialize navigation functionality
     */
    static initNavigation() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileClose = document.querySelector('.mobile-close');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                if (mobileOverlay) mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            if (mobileClose) {
                mobileClose.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    if (mobileOverlay) mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }

            if (mobileOverlay) {
                mobileOverlay.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href !== '#!') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        // Close mobile menu if open
                        if (mobileMenu) {
                            mobileMenu.classList.remove('active');
                            if (mobileOverlay) mobileOverlay.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                    }
                }
            });
        });

        // Sticky navigation on scroll
        const nav = document.querySelector('.premium-nav') || document.querySelector('.top-nav');
        if (nav) {
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                if (currentScroll > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                lastScroll = currentScroll;
            });
        }
    }

    /**
     * Initialize search functionality
     */
    static initSearch() {
        const searchInput = document.getElementById('nav-search-input');
        const searchForm = document.querySelector('.nav-search form');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput ? searchInput.value.trim() : '';
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }

        // Search input autocomplete (placeholder for future enhancement)
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                // TODO: Implement search suggestions
                console.log('Search query:', query);
            });
        }
    }
}

// Load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ComponentLoader.loadAll();
    });
} else {
    ComponentLoader.loadAll();
}
