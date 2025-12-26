const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class DashboardService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Handle API response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || 'API request failed');
        }
        return response.json();
    }

    // Dashboard endpoints
    async getDashboardData() {
        const response = await fetch(`${this.baseURL}/users/dashboard`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getAnalytics(period = '6months') {
        const response = await fetch(`${this.baseURL}/users/analytics?period=${period}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getTransactions(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseURL}/users/transactions?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async exportTransactions(format = 'csv', filters = {}) {
        const queryString = new URLSearchParams({ format, ...filters }).toString();
        const response = await fetch(`${this.baseURL}/users/export-transactions?${queryString}`, {
            headers: this.getAuthHeaders()
        });

        if (format === 'csv') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return { success: true };
        }

        return this.handleResponse(response);
    }

    // Account endpoints
    async getAccounts() {
        const response = await fetch(`${this.baseURL}/accounts`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getAccountBalance(accountId) {
        const response = await fetch(`${this.baseURL}/accounts/${accountId}/balance`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getAccountTransactions(accountId, page = 1, limit = 20) {
        const response = await fetch(`${this.baseURL}/accounts/${accountId}/transactions?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Card endpoints
    async getCards() {
        const response = await fetch(`${this.baseURL}/cards`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async requestCard(cardData) {
        const response = await fetch(`${this.baseURL}/cards`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(cardData)
        });
        return this.handleResponse(response);
    }

    async updateCardStatus(cardId, status, reason = '') {
        const response = await fetch(`${this.baseURL}/cards/${cardId}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status, reason })
        });
        return this.handleResponse(response);
    }

    async setCardPin(cardId, pinData) {
        const response = await fetch(`${this.baseURL}/cards/${cardId}/pin`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(pinData)
        });
        return this.handleResponse(response);
    }

    async getCardTransactions(cardId, page = 1, limit = 20) {
        const response = await fetch(`${this.baseURL}/cards/${cardId}/transactions?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Notification endpoints
    async getNotifications(page = 1, limit = 20, type = '') {
        const queryString = new URLSearchParams({ page, limit, ...(type && { type }) }).toString();
        const response = await fetch(`${this.baseURL}/notifications?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getUnreadNotificationCount() {
        const response = await fetch(`${this.baseURL}/notifications/unread-count`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async markNotificationAsRead(notificationId) {
        const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async markAllNotificationsAsRead() {
        const response = await fetch(`${this.baseURL}/notifications/read-all`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async deleteNotification(notificationId) {
        const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // User profile endpoints
    async getUserProfile() {
        const response = await fetch(`${this.baseURL}/users/profile`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async updateUserProfile(profileData) {
        const response = await fetch(`${this.baseURL}/users/profile`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(profileData)
        });
        return this.handleResponse(response);
    }

    async updateNotificationPreferences(preferences) {
        const response = await fetch(`${this.baseURL}/users/notifications`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ preferences })
        });
        return this.handleResponse(response);
    }

    async getBeneficiaries() {
        const response = await fetch(`${this.baseURL}/users/beneficiaries`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getAccountsSummary() {
        const response = await fetch(`${this.baseURL}/users/accounts-summary`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Admin endpoints (for admin users)
    async getAdminStats() {
        const response = await fetch(`${this.baseURL}/admin/stats`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getAllUsers(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseURL}/admin/users?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getUserDetails(userId) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async updateUserStatus(userId, isActive) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ isActive })
        });
        return this.handleResponse(response);
    }

    // Create a new account
    async createAccount(accountData) {
        const response = await fetch(`${this.baseURL}/accounts`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(accountData)
        });
        return this.handleResponse(response);
    }

    // Get all branches (public endpoint)
    async getBranches() {
        const response = await fetch(`${this.baseURL}/branches`);
        return this.handleResponse(response);
    }

    // Transaction endpoints
    async createTransaction(transactionData) {
        const response = await fetch(`${this.baseURL}/transactions`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(transactionData)
        });
        return this.handleResponse(response);
    }

    async getTransactionById(transactionId) {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getTransactionReceipt(transactionId) {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}/receipt`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async cancelTransaction(transactionId) {
        const response = await fetch(`${this.baseURL}/transactions/${transactionId}/cancel`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Report endpoints
    async submitReport(reportData) {
        const response = await fetch(`${this.baseURL}/reports`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(reportData)
        });
        return this.handleResponse(response);
    }

    async submitReportWithImages(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type for FormData - let browser set it
            },
            body: formData
        });
        return this.handleResponse(response);
    }

    async getReports(page = 1, limit = 20, status = '', category = '') {
        const queryString = new URLSearchParams({
            page,
            limit,
            ...(status && { status }),
            ...(category && { category })
        }).toString();
        const response = await fetch(`${this.baseURL}/reports?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getReportById(reportId) {
        const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async updateReport(reportId, updateData) {
        const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        return this.handleResponse(response);
    }

    async deleteReport(reportId) {
        const response = await fetch(`${this.baseURL}/reports/${reportId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Account lookup for transfers
    async lookupAccount(accountNumber) {
        const response = await fetch(`${this.baseURL}/accounts/lookup/${accountNumber}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
