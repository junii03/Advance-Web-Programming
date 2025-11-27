# Web App (`hbl-clone`) Implementation Reference

## Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **API Communication**: Fetch API
- **State Management**: Context API (and likely Redux/Zustand)
- **Routing**: React Router (likely)

---

## Service Architecture Pattern

### Service Classes
All services follow a consistent pattern with:

1. **Constructor**
   - Initializes `baseURL` from environment variable `VITE_API_BASE_URL`
   - Fallback: `http://localhost:8000/api` if env var not set

2. **getAuthHeaders()**
   - Retrieves JWT token from `localStorage.getItem('token')`
   - Returns object with:
     ```javascript
     {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
     ```

3. **handleResponse()**
   - Checks response.ok
   - Throws error with message on failure
   - Returns `response.json()` on success
   - Has error handling for network failures

---

## Service Classes Implemented

### 1. AdminService (`src/services/adminService.js`)

**Methods**:

**Dashboard**
- `getDashboardStats()` - GET `/admin/stats`

**User Management**
- `getAllUsers(params)` - GET `/admin/users?{queryString}`
  - Params: pagination, filters, sorting
- `getUserDetails(userId)` - GET `/admin/users/{userId}`
- `updateUserStatus(userId, isActive)` - PUT `/admin/users/{userId}/status`
  - Body: { isActive }
- `updateUserVerification(userId, verificationData)` - PUT `/admin/users/{userId}/verify`
  - Body: { verifyEmail, verifyPhone }

**Transaction Management**
- `getAllTransactions(params)` - GET `/admin/transactions?{queryString}`
  - Params: filters, sorting, pagination
- `getTransactionDetails(transactionId)` - GET `/admin/transactions/{transactionId}`
- `flagTransaction(transactionId, flagged, flagReason)` - PUT `/admin/transactions/{transactionId}/flag`
  - Body: { flagged, flagReason }
- `exportTransactions(params)` - GET `/admin/transactions/export?{queryString}&format=csv`
  - Downloads CSV file client-side using Blob

**Loan Management**
- `getAllLoans(params)` - GET `/admin/loans?{queryString}`
- `approveLoan(loanId, action, rejectionReason)` - PUT `/admin/loans/{loanId}/approve`
  - Body: { action, rejectionReason }
  - action: 'approve' | 'reject'

**Card Management**
- `getAllCards(params)` - Complex method:
  - Fetches all users first: `/admin/users?limit=1000`
  - Collects cards from all users
- `updateCardStatus(userId, cardId, status, reason, adminNotes)` - PUT endpoint

---

### 2. DashboardService (`src/services/dashboardService.js`)

**Base Configuration**
- `API_BASE_URL` = `import.meta.env.VITE_API_BASE_URL` || `'http://localhost:8000/api'`

**Methods**:

**Dashboard & Analytics**
- `getDashboardData()` - GET `/users/dashboard`
  - Returns: accounts, balance, recent transactions, etc.
- `getAnalytics(period)` - GET `/users/analytics?period={period}`
  - period: '6months', '1year', 'all', etc.

**Transactions**
- `getTransactions(filters)` - GET `/users/transactions?{queryString}`
  - Filters: dateRange, type, status, amount range, etc.
- `exportTransactions(format, filters)` - GET `/users/export-transactions?{queryString}`
  - Formats: 'csv', 'pdf', 'json'
  - CSV triggers download via Blob
  - Returns: { success: true }

**Accounts**
- `getAccounts()` - GET `/accounts`
  - Returns: Array of accounts with balances
- `getAccountBalance(accountId)` - GET `/accounts/{accountId}/balance`
  - Returns: current balance, available balance
- `getAccountDetails(accountId)` - GET `/accounts/{accountId}`
  - Returns: Full account info (limits, transactions, etc.)
- `requestAccount()` - POST `/accounts`
  - Body: { accountType, purpose, etc. }

**Cards**
- `getCards()` - GET `/accounts/{accountId}/cards`
  - Returns: Array of cards
- `getCardDetails(cardId)` - GET `/cards/{cardId}`

---

## API Base URL Configuration

### Environment Variables
All services use: `import.meta.env.VITE_API_BASE_URL`

**Default Fallback**: `http://localhost:8000/api`

### Expected Environment Setup
Create `.env` or `.env.local`:
```
VITE_API_BASE_URL=http://localhost:5000/api  # Local dev
VITE_API_BASE_URL=https://api.hbl.com/api     # Production
```

---

## Authentication Pattern in Web

### Token Storage
- Token stored in `localStorage` with key: `'token'`
- Retrieved in `getAuthHeaders()` for every API request

### Token Lifecycle
1. User logs in
2. Backend returns JWT token
3. Token saved to localStorage
4. Token included in all subsequent requests
5. Backend validates token via Bearer authentication

### Protected Routes
All admin endpoints require:
- Valid JWT token
- Admin role authorization (handled by backend)

---

## Error Handling Pattern

```javascript
async handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}
```

**Error Scenarios**:
- Network failure → Generic "Network error"
- API error response → Backend error message
- HTTP errors (4xx, 5xx) → Status code in message

---

## Data Export Pattern

```javascript
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
```

**Pattern**:
- CSV exports trigger browser download
- Uses Blob for file handling
- Creates temp URL and clicks hidden link
- Cleans up resources after download

---

## Query String Parameter Handling

```javascript
const queryString = new URLSearchParams(params).toString();
const response = await fetch(`${this.baseURL}/path?${queryString}`, {
    headers: this.getAuthHeaders()
});
```

**Common Params**:
- `limit`: Pagination limit
- `page`: Page number
- `sort`: Sort field and direction
- `dateFrom`, `dateTo`: Date ranges
- `status`: Filter by status
- `type`: Filter by type
- `format`: Export format

---

## Common Response Structures

### Success Response
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### Single Item Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## Service Usage Pattern

```javascript
// Import service
import AdminService from './services/adminService.js';

// Instantiate
const adminService = new AdminService();

// Use methods
try {
    const users = await adminService.getAllUsers({ limit: 10, page: 1 });
    console.log(users.data);
} catch (error) {
    console.error('Failed to fetch users:', error.message);
}
```

---

## Pages Using Services

### Transactions Page (`src/pages/customer/ViewAllTransactions.jsx`)
- Uses DashboardService for transactions fetching
- Implements filtering, sorting, pagination
- CSV export functionality
- Displays transaction history table

### Loan Pages
- `ApplyLoan.jsx` - Loan application form
  - Uses: `POST /loans`, `POST /loans/calculate`
- `Loan.jsx` - View loans list
  - Uses: `GET /loans`

---

## Key Implementation Details

### No Caching Layer
- Services make fresh API calls each time
- No request/response caching implemented
- Consider adding cache layer for repeated calls

### No Global State
- Services are stateless
- State managed by React components
- Consider Redux/Zustand for complex state

### No Retry Logic
- Failed requests are not retried
- Single attempt per request
- Consider implementing exponential backoff

### No Timeout Configuration
- Default fetch timeout (browser default)
- Consider setting explicit timeouts

---

## Recommended Enhancements

1. Add request/response interceptors
2. Implement retry logic
3. Add timeout handling
4. Add response caching
5. Add global error handling
6. Add loading states
7. Add offline support
8. Migrate to Axios or similar client
