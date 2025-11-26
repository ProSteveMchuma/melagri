// API Service for Melagri E-commerce
class APIService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.auth)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
      auth: true
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
      auth: true
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
      auth: true
    });
  }

  async updateStock(id, stock) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
      auth: true
    });
  }

  // Orders API
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders() {
    return this.request('/orders', { auth: true });
  }

  async getOrder(orderNumber) {
    return this.request(`/orders/${orderNumber}`);
  }

  async updateOrderStatus(orderNumber, status) {
    return this.request(`/orders/${orderNumber}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      auth: true
    });
  }

  async cancelOrder(orderNumber) {
    return this.request(`/orders/${orderNumber}/cancel`, {
      method: 'PUT',
      auth: true
    });
  }

  // Users API
  async register(userData) {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  logout() {
    this.clearToken();
    localStorage.removeItem('user');
  }

  async getProfile() {
    return this.request('/users/me', { auth: true });
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      auth: true
    });
  }

  async updatePassword(passwordData) {
    return this.request('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
      auth: true
    });
  }

  async getUsers() {
    return this.request('/users', { auth: true });
  }

  // Payments API
  async initiateMpesaPayment(paymentData) {
    return this.request('/payments/mpesa/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async queryPaymentStatus(checkoutRequestId) {
    return this.request(`/payments/mpesa/status/${checkoutRequestId}`);
  }

  async confirmCODOrder(orderNumber) {
    return this.request('/payments/cod/confirm', {
      method: 'POST',
      body: JSON.stringify({ orderNumber })
    });
  }

  // Helper methods
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}

// Export as singleton
const api = new APIService();
