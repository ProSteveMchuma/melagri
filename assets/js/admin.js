/**
 * Admin Dashboard Management
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentProduct = null;
        this.init();
    }

    init() {
        // Check if user is admin
        if (!api.isAuthenticated() || !api.isAdmin()) {
            alert('Access denied. Admin login required.');
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        this.loadDashboardData();
        this.displayUserInfo();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.dataset.section;
                if (section) {
                    e.preventDefault();
                    this.showSection(section);
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('active');
            });
        }

        // Logout
        document.getElementById('admin-logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        // Product form
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct(e.target);
        });

        // Order status filter
        document.getElementById('order-status-filter')?.addEventListener('change', (e) => {
            this.loadOrders(e.target.value);
        });
    }

    showSection(section) {
        // Update nav
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`section-${section}`)?.classList.add('active');

        // Update title
        document.getElementById('section-title').textContent = 
            section.charAt(0).toUpperCase() + section.slice(1);

        // Load section data
        this.currentSection = section;
        this.loadSectionData(section);
    }

    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Load stats
            const [productsRes, ordersRes, usersRes] = await Promise.all([
                api.getProducts(),
                api.getOrders(),
                api.getUsers().catch(() => ({success: true, count: 0, data: []}))
            ]);

            // Update stats
            document.getElementById('stat-products').textContent = productsRes.count || 0;
            document.getElementById('stat-orders').textContent = ordersRes.count || 0;
            document.getElementById('stat-users').textContent = usersRes.count || 0;

            // Calculate revenue
            const revenue = ordersRes.data?.reduce((sum, order) => 
                sum + (order.pricing?.total || 0), 0) || 0;
            document.getElementById('stat-revenue').textContent = 
                `KSh ${revenue.toLocaleString()}`;

            // Load recent orders
            this.loadRecentOrders(ordersRes.data);

            // Load low stock products
            this.loadLowStock(productsRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    loadRecentOrders(orders) {
        const container = document.getElementById('recent-orders-list');
        if (!orders || orders.length === 0) {
            container.innerHTML = '<p class="text-muted">No orders yet</p>';
            return;
        }

        const recent = orders.slice(0, 5);
        container.innerHTML = recent.map(order => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${order.orderNumber}</h4>
                    <p>${order.customer.name} - KSh ${order.pricing.total.toLocaleString()}</p>
                </div>
                <span class="recent-item-badge status-${order.status}">${order.status}</span>
            </div>
        `).join('');
    }

    loadLowStock(products) {
        const container = document.getElementById('low-stock-list');
        const lowStock = products?.filter(p => p.stock < 20).slice(0, 5) || [];
        
        if (lowStock.length === 0) {
            container.innerHTML = '<p class="text-muted">All products well stocked</p>';
            return;
        }

        container.innerHTML = lowStock.map(product => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} - ${product.brand}</p>
                </div>
                <span class="recent-item-badge" style="background: #fff3cd; color: #856404;">
                    ${product.stock} left
                </span>
            </div>
        `).join('');
    }

    async loadProducts() {
        try {
            const response = await api.getProducts();
            const tbody = document.getElementById('products-tbody');

            if (!response.success || !response.data || response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
                return;
            }

            tbody.innerHTML = response.data.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>KSh ${product.price.toLocaleString()}</td>
                    <td>${product.stock}</td>
                    <td>
                        <span class="status-badge ${product.isActive ? 'status-active' : 'status-inactive'}">
                            ${product.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-action btn-edit" onclick="adminDashboard.editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" onclick="adminDashboard.deleteProduct('${product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading products:', error);
            document.getElementById('products-tbody').innerHTML = 
                '<tr><td colspan="7" class="text-center text-danger">Error loading products</td></tr>';
        }
    }

    async loadOrders(status = 'all') {
        try {
            const response = await api.getOrders();
            const tbody = document.getElementById('orders-tbody');

            if (!response.success || !response.data || response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
                return;
            }

            let orders = response.data;
            if (status !== 'all') {
                orders = orders.filter(o => o.status === status);
            }

            tbody.innerHTML = orders.map(order => {
                const date = new Date(order.createdAt).toLocaleDateString();
                return `
                    <tr>
                        <td>${order.orderNumber}</td>
                        <td>${order.customer.name}<br><small>${order.customer.email}</small></td>
                        <td>${date}</td>
                        <td>KSh ${order.pricing.total.toLocaleString()}</td>
                        <td>
                            <span class="status-badge status-${order.payment.status}">
                                ${order.payment.method.toUpperCase()}
                            </span>
                        </td>
                        <td>
                            <select class="form-select" onchange="adminDashboard.updateOrderStatus('${order.orderNumber}', this.value)">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn-action btn-view" onclick="adminDashboard.viewOrder('${order.orderNumber}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading orders:', error);
            document.getElementById('orders-tbody').innerHTML = 
                '<tr><td colspan="7" class="text-center text-danger">Error loading orders</td></tr>';
        }
    }

    async loadUsers() {
        try {
            const response = await api.getUsers();
            const tbody = document.getElementById('users-tbody');

            if (!response.success || !response.data || response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
                return;
            }

            tbody.innerHTML = response.data.map(user => {
                const date = new Date(user.createdAt).toLocaleDateString();
                return `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td><span class="status-badge status-${user.role}">${user.role}</span></td>
                        <td>${date}</td>
                        <td>
                            <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-action btn-delete" onclick="adminDashboard.deleteUser('${user._id}')">
                                <i class="fas fa-ban"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading users:', error);
            document.getElementById('users-tbody').innerHTML = 
                '<tr><td colspan="7" class="text-center text-danger">Error loading users</td></tr>';
        }
    }

    // Product Management
    openProductModal(product = null) {
        this.currentProduct = product;
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('modal-title');

        if (product) {
            title.textContent = 'Edit Product';
            form.id.value = product.id;
            form.name.value = product.name;
            form.category.value = product.category;
            form.brand.value = product.brand;
            form.price.value = product.price;
            form.stock.value = product.stock;
            form.unit.value = product.unit;
            form.description.value = product.description;
            form.image.value = product.image || '';
            form.features.value = (product.features || []).join('\n');
            form.id.readOnly = true;
        } else {
            title.textContent = 'Add Product';
            form.reset();
            form.id.readOnly = false;
        }

        modal.classList.add('active');
    }

    closeProductModal() {
        document.getElementById('product-modal').classList.remove('active');
        this.currentProduct = null;
    }

    async saveProduct(form) {
        const formData = new FormData(form);
        const features = formData.get('features').split('\n').filter(f => f.trim());
        
        const productData = {
            id: formData.get('id'),
            name: formData.get('name'),
            category: formData.get('category'),
            brand: formData.get('brand'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            unit: formData.get('unit'),
            description: formData.get('description'),
            image: formData.get('image') || `/assets/products/${formData.get('id')}.jpg`,
            features,
            isActive: true
        };

        try {
            let response;
            if (this.currentProduct) {
                response = await api.updateProduct(productData.id, productData);
            } else {
                response = await api.createProduct(productData);
            }

            if (response.success) {
                alert(`Product ${this.currentProduct ? 'updated' : 'created'} successfully!`);
                this.closeProductModal();
                this.loadProducts();
            } else {
                alert('Error: ' + response.message);
            }
        } catch (error) {
            alert('Error saving product: ' + error.message);
        }
    }

    async editProduct(id) {
        try {
            const response = await api.getProduct(id);
            if (response.success) {
                this.openProductModal(response.data);
            }
        } catch (error) {
            alert('Error loading product: ' + error.message);
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await api.deleteProduct(id);
            if (response.success) {
                alert('Product deleted successfully!');
                this.loadProducts();
            }
        } catch (error) {
            alert('Error deleting product: ' + error.message);
        }
    }

    // Order Management
    async updateOrderStatus(orderNumber, status) {
        try {
            const response = await api.updateOrderStatus(orderNumber, status);
            if (response.success) {
                alert('Order status updated!');
                this.loadOrders();
            }
        } catch (error) {
            alert('Error updating order: ' + error.message);
        }
    }

    async viewOrder(orderNumber) {
        try {
            const response = await api.getOrder(orderNumber);
            if (!response.success) return;

            const order = response.data;
            const modal = document.getElementById('order-modal');
            const content = document.getElementById('order-details-content');

            content.innerHTML = `
                <h2>Order Details</h2>
                <div class="order-details">
                    <div class="order-section">
                        <h3>Order Information</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                    </div>

                    <div class="order-section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customer.name}</p>
                        <p><strong>Email:</strong> ${order.customer.email}</p>
                        <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    </div>

                    <div class="order-section">
                        <h3>Delivery Information</h3>
                        <p><strong>Address:</strong> ${order.delivery.address}</p>
                        <p><strong>City:</strong> ${order.delivery.city}</p>
                        <p><strong>Region:</strong> ${order.delivery.region}</p>
                        ${order.delivery.instructions ? `<p><strong>Instructions:</strong> ${order.delivery.instructions}</p>` : ''}
                    </div>

                    <div class="order-section">
                        <h3>Items</h3>
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>KSh ${item.price.toLocaleString()}</td>
                                        <td>${item.quantity}</td>
                                        <td>KSh ${item.subtotal.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="order-section">
                        <h3>Payment Summary</h3>
                        <p><strong>Subtotal:</strong> KSh ${order.pricing.subtotal.toLocaleString()}</p>
                        <p><strong>Delivery Fee:</strong> KSh ${order.pricing.deliveryFee.toLocaleString()}</p>
                        <p><strong>Total:</strong> KSh ${order.pricing.total.toLocaleString()}</p>
                        <p><strong>Method:</strong> ${order.payment.method.toUpperCase()}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.payment.status}">${order.payment.status}</span></p>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        } catch (error) {
            alert('Error loading order: ' + error.message);
        }
    }

    closeOrderModal() {
        document.getElementById('order-modal').classList.remove('active');
    }

    // User Management
    async deleteUser(id) {
        if (!confirm('Are you sure you want to deactivate this user?')) return;

        try {
            const response = await api.deleteUser(id);
            if (response.success) {
                alert('User deactivated successfully!');
                this.loadUsers();
            }
        } catch (error) {
            alert('Error deactivating user: ' + error.message);
        }
    }

    displayUserInfo() {
        const user = api.getCurrentUser();
        if (user) {
            document.getElementById('admin-user-name').textContent = user.name;
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            api.logout();
            window.location.href = 'login.html';
        }
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();
