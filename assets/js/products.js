/**
 * Product Catalog System
 * Handles product loading, filtering, search, and display
 */

class ProductCatalog {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    async init() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const searchParam = urlParams.get('search');

        if (categoryParam) {
            this.currentCategory = categoryParam;
        }

        if (searchParam) {
            this.searchQuery = searchParam;
            // Set search input value if it exists
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.value = this.searchQuery;
            }
        }

        await this.loadProducts();
        this.renderCategories();

        // Apply initial filters
        if (this.currentCategory !== 'all' || this.searchQuery) {
            this.filterProducts();

            // Update active category button if category param exists
            if (this.currentCategory !== 'all') {
                // We need to do this after renderCategories
                setTimeout(() => {
                    const btns = document.querySelectorAll('.category-filter-btn');
                    btns.forEach(btn => {
                        if (btn.dataset.category === this.currentCategory) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }, 0);
            }
        } else {
            this.renderProducts();
        }

        this.attachEventListeners();
    }

    // Load products from API
    async loadProducts() {
        try {
            const response = await api.getProducts();
            if (response.success) {
                // Transform API data to match frontend format
                this.products = response.data.map(product => ({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    description: product.description,
                    brand: product.brand,
                    image: product.image,
                    unit: product.unit,
                    stock: product.stock,
                    inStock: product.stock > 0,
                    features: product.features || [],
                    sku: product.id,
                    weight: `${product.unit}`,
                    volume: null
                }));

                // Extract unique categories
                const uniqueCategories = [...new Set(this.products.map(p => p.category))];
                this.categories = uniqueCategories.map(cat => ({
                    id: cat,
                    name: cat,
                    icon: this.getCategoryIcon(cat)
                }));

                this.filteredProducts = this.products;
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'Animal Feeds': 'fas fa-paw',
            'Fertilizers': 'fas fa-seedling',
            'Seeds': 'fas fa-leaf',
            'Crop Protection': 'fas fa-shield-alt',
            'Veterinary': 'fas fa-syringe'
        };
        return icons[category] || 'fas fa-box';
    }

    // Render category filters
    renderCategories() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        const allCategory = `
            <button class="category-filter-btn active" data-category="all">
                <i class="fas fa-th"></i>
                <span>All Products</span>
            </button>
        `;

        const categoryButtons = this.categories.map(cat => `
            <button class="category-filter-btn" data-category="${cat.id}">
                <i class="${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>
        `).join('');

        categoryFilter.innerHTML = allCategory + categoryButtons;
    }

    // Render products
    renderProducts() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        if (this.filteredProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    // Create product card HTML
    createProductCard(product) {
        const stockStatus = product.inStock ?
            '<span class="stock-status in-stock"><i class="fas fa-check-circle"></i> In Stock</span>' :
            '<span class="stock-status out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</span>';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='assets/logos/Makamithi Logo.png'">
                    ${!product.inStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
                </div>
                <div class="product-details">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-brand"><i class="fas fa-certificate"></i> ${product.brand}</span>
                        <span class="product-unit">${product.weight || product.volume || product.unit}</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="currency">KSh</span>
                            <span class="amount">${product.price.toLocaleString()}</span>
                            <span class="per-unit">/ ${product.unit}</span>
                        </div>
                        ${stockStatus}
                    </div>
                    <div class="product-actions">
                        <button class="btn-view-details" onclick="productCatalog.showProductDetails('${product.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${product.inStock ? `
                            <button class="btn-add-cart add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                        ` : `
                            <button class="btn-add-cart" disabled>
                                <i class="fas fa-ban"></i> Unavailable
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    // Get category name by ID
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Other';
    }

    // Filter products
    filterProducts() {
        let filtered = this.products;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.brand.toLowerCase().includes(query)
            );
        }

        this.filteredProducts = filtered;
        this.renderProducts();
        this.updateProductCount();
    }

    // Update product count display
    updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} products`;
        }
    }

    // Show product details modal
    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        if (!modal) return;

        const modalContent = modal.querySelector('.product-modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" onclick="productCatalog.closeProductModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="product-modal-grid">
                <div class="product-modal-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                </div>
                <div class="product-modal-details">
                    <div class="product-category-badge">${this.getCategoryName(product.category)}</div>
                    <h2>${product.name}</h2>
                    <div class="product-brand-info">
                        <i class="fas fa-certificate"></i> ${product.brand}
                    </div>
                    <div class="product-price-large">
                        <span class="currency">KSh</span>
                        <span class="amount">${product.price.toLocaleString()}</span>
                        <span class="per-unit">/ ${product.unit}</span>
                    </div>
                    <p class="product-description-full">${product.description}</p>
                    
                    <div class="product-features">
                        <h4>Key Features:</h4>
                        <ul>
                            ${product.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-specifications">
                        <div class="spec-item">
                            <span class="spec-label">SKU:</span>
                            <span class="spec-value">${product.sku}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Weight/Volume:</span>
                            <span class="spec-value">${product.weight || product.volume || 'N/A'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Stock:</span>
                            <span class="spec-value ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                                ${product.inStock ? `${product.stock} units available` : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                    
                    ${product.inStock ? `
                        <div class="quantity-selector">
                            <label>Quantity:</label>
                            <div class="quantity-controls">
                                <button onclick="productCatalog.decreaseQuantity()"><i class="fas fa-minus"></i></button>
                                <input type="number" id="product-quantity" value="1" min="1" max="${product.stock}">
                                <button onclick="productCatalog.increaseQuantity(${product.stock})"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <button class="btn-add-cart-large add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}' data-quantity-input="product-quantity">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    ` : `
                        <button class="btn-add-cart-large" disabled>
                            <i class="fas fa-ban"></i> Currently Unavailable
                        </button>
                    `}
                    
                    <div class="product-contact">
                        <p><i class="fas fa-phone"></i> Need help? Call us: <a href="tel:+254768164336">0768 164336</a></p>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close product modal
    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Quantity controls
    increaseQuantity(max) {
        const input = document.getElementById('product-quantity');
        if (input && parseInt(input.value) < max) {
            input.value = parseInt(input.value) + 1;
        }
    }

    decreaseQuantity() {
        const input = document.getElementById('product-quantity');
        if (input && parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Category filter
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-filter-btn')) {
                const btn = e.target.closest('.category-filter-btn');
                const category = btn.dataset.category;

                // Update active state
                document.querySelectorAll('.category-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter products
                this.currentCategory = category;
                this.filterProducts();
            }
        });

        // Search
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterProducts();
            });
        }

        // Modal close on backdrop click
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }

        // Add to cart with custom quantity
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn[data-quantity-input]')) {
                const btn = e.target.closest('.add-to-cart-btn');
                const quantityInputId = btn.dataset.quantityInput;
                const quantityInput = document.getElementById(quantityInputId);
                if (quantityInput) {
                    btn.dataset.quantity = quantityInput.value;
                }
            }
        });
    }

    // Show error message
    showError(message) {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize catalog when DOM is ready
let productCatalog;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        productCatalog = new ProductCatalog();
    });
} else {
    productCatalog = new ProductCatalog();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCatalog;
}
