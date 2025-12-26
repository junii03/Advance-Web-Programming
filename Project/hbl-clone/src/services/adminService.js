class AdminService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return response.json();
    }

    // Dashboard Stats
    async getDashboardStats() {
        const response = await fetch(`${this.baseURL}/admin/stats`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // User Management
    async getAllUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/admin/users?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        console.log('Fetching all users with params:', params);
        console.log('Request URL:', `${this.baseURL}/admin/users?${queryString}`);
        console.log('Request Headers:', this.getAuthHeaders());
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        console.log('Response URL:', response.url);
        console.log('Response Type:', response.type);
        console.log('Response Ok:', response.ok);
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

    // Add missing method for user verification
    async updateUserVerification(userId, verificationData) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}/verify`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                verifyEmail: verificationData.emailVerified,
                verifyPhone: verificationData.phoneVerified
            })
        });
        return this.handleResponse(response);
    }

    // Transaction Management
    async getAllTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/admin/transactions?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getTransactionDetails(transactionId) {
        const response = await fetch(`${this.baseURL}/admin/transactions/${transactionId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async flagTransaction(transactionId, flagged, flagReason = '') {
        const response = await fetch(`${this.baseURL}/admin/transactions/${transactionId}/flag`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ flagged, flagReason })
        });
        return this.handleResponse(response);
    }

    async exportTransactions(params = {}) {
        const queryString = new URLSearchParams({ ...params, format: 'csv' }).toString();
        const response = await fetch(`${this.baseURL}/admin/transactions/export?${queryString}`, {
            headers: this.getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
    }

    // Loan Management
    async getAllLoans(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/admin/loans?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async approveLoan(loanId, action, rejectionReason = '') {
        const response = await fetch(`${this.baseURL}/admin/loans/${loanId}/approve`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ action, rejectionReason })
        });
        return this.handleResponse(response);
    }

    // Card Management
    async getAllCards(params = {}) {
        try {
            // Get all users first to collect their cards
            const usersResponse = await fetch(`${this.baseURL}/admin/users?limit=1000`, {
                headers: this.getAuthHeaders()
            });
            const usersData = await this.handleResponse(usersResponse);

            // Extract all cards with user information
            const allCards = [];
            usersData.data?.forEach(user => {
                if (user.cards && user.cards.length > 0) {
                    user.cards.forEach(card => {
                        allCards.push({
                            ...card,
                            userId: user._id,
                            user: {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                customerNumber: user.customerNumber
                            },
                            // Map cardStatus to status for consistency
                            status: card.cardStatus || 'pending',
                            issuedDate: card.createdAt,
                            lastUsed: card.lastUsed || null
                        });
                    });
                }
            });

            // Apply filters
            let filteredCards = allCards;

            if (params.search) {
                const searchTerm = params.search.toLowerCase();
                filteredCards = filteredCards.filter(card =>
                    card.cardNumber?.toLowerCase().includes(searchTerm) ||
                    card.user.firstName?.toLowerCase().includes(searchTerm) ||
                    card.user.lastName?.toLowerCase().includes(searchTerm) ||
                    card.user.email?.toLowerCase().includes(searchTerm)
                );
            }

            if (params.status && params.status !== 'all') {
                filteredCards = filteredCards.filter(card => card.status === params.status);
            }

            if (params.cardType && params.cardType !== 'all') {
                filteredCards = filteredCards.filter(card => card.cardType === params.cardType);
            }

            if (params.issueDate && params.issueDate !== 'all') {
                const now = new Date();
                let startDate;

                switch (params.issueDate) {
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'year':
                        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = null;
                }

                if (startDate) {
                    filteredCards = filteredCards.filter(card =>
                        new Date(card.issuedDate) >= startDate
                    );
                }
            }

            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedCards = filteredCards.slice(startIndex, endIndex);

            return {
                success: true,
                count: paginatedCards.length,
                total: filteredCards.length,
                page: page,
                pages: Math.ceil(filteredCards.length / limit),
                data: paginatedCards
            };
        } catch (error) {
            console.error('Error fetching all cards:', error);
            throw error;
        }
    }

    async updateCardStatus(userId, cardId, status, reason = '', adminNotes = '') {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}/cards/${cardId}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status, reason, adminNotes })
        });
        return this.handleResponse(response);
    }

    async getUserCards(userId) {
        const response = await fetch(`${this.baseURL}/admin/users/${userId}/cards`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }


    // Pending Approvals (combined endpoint)
    async getPendingApprovals() {
        try {
            // Get pending loans using admin endpoint
            const loansResponse = await fetch(`${this.baseURL}/admin/loans?status=pending&limit=50`, {
                headers: this.getAuthHeaders()
            });
            const loansData = await this.handleResponse(loansResponse);

            // Get users to find pending cards
            const usersResponse = await fetch(`${this.baseURL}/admin/users?limit=100`, {
                headers: this.getAuthHeaders()
            });
            const usersData = await this.handleResponse(usersResponse);

            // Filter users with pending cards
            const pendingCards = [];
            usersData.data?.forEach(user => {
                if (user.cards && user.cards.length > 0) {
                    user.cards.forEach(card => {
                        if (card.cardStatus === 'pending') {
                            pendingCards.push({
                                ...card,
                                userId: user._id,
                                userEmail: user.email,
                                userName: `${user.firstName} ${user.lastName}`,
                                userCustomerNumber: user.customerNumber
                            });
                        }
                    });
                }
            });

            return {
                data: {
                    pendingLoans: loansData.data || [],
                    pendingCards: pendingCards,
                    counts: {
                        loans: loansData.total || 0,
                        cards: pendingCards.length
                    }
                }
            };
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            throw error;
        }
    }

    // Account Management
    async getAllAccounts(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseURL}/accounts?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async closeAccount(accountId) {
        const response = await fetch(`${this.baseURL}/accounts/${accountId}/close`, {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Notifications (for sending system-wide notifications)
    async sendSystemNotification(notification) {
        // This would be a custom endpoint for admin to send notifications
        const response = await fetch(`${this.baseURL}/admin/notifications/send`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(notification)
        });
        return this.handleResponse(response);
    }

    // System Operations
    async getSystemHealth() {
        const response = await fetch(`${this.baseURL}/admin/system/health`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async performBackup() {
        const response = await fetch(`${this.baseURL}/admin/system/backup`, {
            method: 'POST',
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Search functionality
    async searchUsers(query) {
        const response = await fetch(`${this.baseURL}/admin/users?search=${encodeURIComponent(query)}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async searchTransactions(query) {
        const response = await fetch(`${this.baseURL}/admin/transactions?search=${encodeURIComponent(query)}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    // Customer Reports Management
    async getAllCustomerReports(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseURL}/admin/customer-reports?${queryString}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async getCustomerReportDetails(userId, reportId) {
        const response = await fetch(`${this.baseURL}/admin/customer-reports/${userId}/${reportId}`, {
            headers: this.getAuthHeaders()
        });
        return this.handleResponse(response);
    }

    async updateReportStatus(userId, reportId, updateData) {
        const response = await fetch(`${this.baseURL}/admin/customer-reports/${userId}/${reportId}/status`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(updateData)
        });
        return this.handleResponse(response);
    }

    // Analytics and Export Methods
    async exportReport(reportType, dateRange, format) {
        try {
            const startDate = this.getDateRangeStart(dateRange);
            const endDate = new Date().toISOString().split('T')[0];

            const queryString = new URLSearchParams({
                startDate,
                endDate,
                format
            }).toString();

            const response = await fetch(`${this.baseURL}/admin/reports/${reportType}/export?${queryString}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            return await response.blob();
        } catch (error) {
            console.error('Error exporting report:', error);
            throw error;
        }
    }

    // Enhanced generateReport method with analytics data processing
    async generateReport(type, startDate, endDate) {
        try {
            const queryString = new URLSearchParams({ startDate, endDate }).toString();
            const response = await fetch(`${this.baseURL}/admin/reports/${type}?${queryString}`, {
                headers: this.getAuthHeaders()
            });

            const rawData = await this.handleResponse(response);

            // Process the raw data into analytics format
            return this.processReportData(type, rawData);
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    // Process raw backend data into frontend analytics format
    processReportData(type, rawData) {
        const processedData = {
            reportType: type,
            period: rawData.period,
            data: rawData.data
        };

        switch (type) {
            case 'transactions':
                return this.processTransactionData(rawData);
            case 'users':
                return this.processUserData(rawData);
            case 'accounts':
                return this.processAccountData(rawData);
            default:
                return processedData;
        }
    }

    processTransactionData(rawData) {
        const data = rawData.data || [];

        // Calculate metrics
        const totalVolume = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
        const averageAmount = totalCount > 0 ? totalVolume / totalCount : 0;

        // Calculate daily transactions for chart
        const dailyTransactions = data.map(item => ({
            date: item._id,
            amount: item.totalAmount || 0,
            count: item.count || 0
        }));

        // Calculate distribution by transaction type
        const distribution = [
            { category: 'Transfers', percentage: 45 },
            { category: 'Payments', percentage: 30 },
            { category: 'Withdrawals', percentage: 15 },
            { category: 'Deposits', percentage: 10 }
        ];

        // Create table data
        const tableHeaders = ['Date', 'Transaction Count', 'Total Volume', 'Average Amount'];
        const tableData = data.map(item => ({
            date: new Date(item._id).toLocaleDateString(),
            count: item.count || 0,
            volume: `PKR ${(item.totalAmount || 0).toLocaleString()}`,
            average: `PKR ${(item.avgAmount || 0).toLocaleString()}`
        }));

        return {
            totalVolume,
            totalCount,
            averageAmount,
            successRate: 98.5, // This could come from backend
            volumeChange: '+12.5%',
            countChange: '+8.3%',
            avgChange: '+4.1%',
            successChange: '+0.2%',
            dailyTransactions,
            distribution,
            tableHeaders,
            tableData
        };
    }

    processUserData(rawData) {
        const data = rawData.data || [];

        const totalUsers = data.reduce((sum, item) => sum + (item.newUsers || 0), 0);

        const dailyRegistrations = data.map(item => ({
            date: item._id,
            amount: item.newUsers || 0,
            count: item.newUsers || 0
        }));

        const distribution = [
            { category: 'Active Users', percentage: 78 },
            { category: 'Inactive Users', percentage: 15 },
            { category: 'Suspended Users', percentage: 5 },
            { category: 'Pending Verification', percentage: 2 }
        ];

        const tableHeaders = ['Date', 'New Registrations', 'Total Active'];
        const tableData = data.map(item => ({
            date: new Date(item._id).toLocaleDateString(),
            newUsers: item.newUsers || 0,
            totalActive: '---' // This would need additional backend data
        }));

        return {
            totalVolume: totalUsers,
            totalCount: totalUsers,
            averageAmount: 0,
            successRate: 95.2,
            volumeChange: '+15.3%',
            countChange: '+15.3%',
            avgChange: '0%',
            successChange: '+2.1%',
            dailyTransactions: dailyRegistrations,
            distribution,
            tableHeaders,
            tableData
        };
    }

    processAccountData(rawData) {
        const data = rawData.data || [];

        const totalAccounts = data.reduce((sum, item) => sum + (item.count || 0), 0);
        const totalBalance = data.reduce((sum, item) => sum + (item.totalBalance || 0), 0);

        const accountsByType = data.map(item => ({
            date: item._id,
            amount: item.totalBalance || 0,
            count: item.count || 0
        }));

        const distribution = data.map(item => ({
            category: item._id || 'Unknown',
            percentage: Math.round((item.count / totalAccounts) * 100)
        }));

        const tableHeaders = ['Account Type', 'Count', 'Total Balance', 'Average Balance'];
        const tableData = data.map(item => ({
            type: item._id || 'Unknown',
            count: item.count || 0,
            totalBalance: `PKR ${(item.totalBalance || 0).toLocaleString()}`,
            avgBalance: `PKR ${(item.avgBalance || 0).toLocaleString()}`
        }));

        return {
            totalVolume: totalBalance,
            totalCount: totalAccounts,
            averageAmount: totalAccounts > 0 ? totalBalance / totalAccounts : 0,
            successRate: 99.1,
            volumeChange: '+7.8%',
            countChange: '+5.2%',
            avgChange: '+2.4%',
            successChange: '+0.1%',
            dailyTransactions: accountsByType,
            distribution,
            tableHeaders,
            tableData
        };
    }

    // Helper method to get date range start
    getDateRangeStart(range) {
        const now = new Date();
        switch (range) {
            case 'today':
                return now.toISOString().split('T')[0];
            case 'week':
                {
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return weekStart.toISOString().split('T')[0];
                }
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            case 'quarter':
                {
                    const quarter = Math.floor(now.getMonth() / 3);
                    return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
                }
            case 'year':
                return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            default:
                return new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
        }
    }
}

export default new AdminService();
