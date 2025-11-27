# HBL Banking Application - Comprehensive Research Summary

## Executive Summary

This is a full-stack banking application with:
- **Backend**: Node.js/Express REST API with MongoDB, Redis, and Socket.IO
- **Web Frontend**: React 18 with Vite and Tailwind CSS
- **Mobile**: React Native (Expo) with TypeScript and NativeWind
- **Status**: Backend fully implemented with comprehensive API; Web has service layer implemented; Mobile has UI shell with mock authentication only

---

## Key Findings

### 1. Backend API Structure (Complete)

**Base URL**: `http://localhost:5000` (default), configurable via `PORT` env var

**Total Endpoints**: 11 route modules with ~60+ endpoints total

**Key Routes**:
- `/api/auth` - Authentication (6 endpoints)
- `/api/accounts` - Account management (4+ endpoints)
- `/api/transactions` - Money transfers (4+ endpoints)
- `/api/cards` - Card management (5+ endpoints)
- `/api/loans` - Loan applications (4 endpoints)
- `/api/users` - User profile & dashboard (6+ endpoints)
- `/api/admin` - Admin dashboard (13+ endpoints)
- `/api/branches` - Branch/ATM locations (4 endpoints)
- `/api/notifications` - Real-time notifications (5 endpoints)
- `/api/uploads` - File uploads (6 endpoints)
- `/api/reports` - Reporting endpoints (details needed)

**Authentication**: JWT Bearer token in Authorization header
**Rate Limiting**: 100 requests per 15 minutes on `/api/*`
**Security**: Helmet.js headers, CORS configured, Content Security Policy

### 2. Mobile App Current State (Development Stage)

**Status**: UI/routing structure in place, authentication stubbed with mocks

**What's Implemented**:
- ✓ Expo Router file-based routing with TypeScript
- ✓ NativeWind styling (Tailwind for React Native)
- ✓ Auth context provider (mocked, no real API calls)
- ✓ Screen structure (auth, home, transactions, accounts, etc.)
- ✓ UI components library (buttons, inputs, cards, etc.)
- ✓ Type definitions

**What's Missing**:
- ✗ API service layer (no fetch calls to backend)
- ✗ Real authentication (mock 1-second delay)
- ✗ Token storage (no AsyncStorage integration)
- ✗ Account/transaction/card/loan endpoints
- ✗ Error handling and retry logic
- ✗ Real-time notifications (Socket.IO)
- ✗ Image caching/optimization
- ✗ Offline support

### 3. Web App Services (Reference Implementation)

**Status**: Fully functional with service classes implemented

**Services Implemented**:
- `AdminService` - Admin dashboard with user/transaction/loan/card management
- `DashboardService` - User dashboard with analytics, transactions, accounts, cards

**Service Pattern**:
```javascript
class Service {
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
    if (!response.ok) throw new Error(...);
    return response.json();
  }
}
```

---

## Detailed Component Breakdown

### Backend Models

**User Model**:
- Personal: firstName, lastName, email, phone, cnic, dateOfBirth, gender
- Address: street, city, state, postalCode, country
- Auth: password (hashed), role (customer|employee|manager|admin)
- Status: isActive, isEmailVerified, isPhoneVerified
- Profile: profilePicture (Cloudinary URL)

**Account Model**:
- Identification: accountNumber, iban
- Owner: userId (reference)
- Details: accountType (savings|current|fixed_deposit|islamic_savings|salary), accountTitle
- Balance: balance, availableBalance
- Limits: dailyTransactionLimit, monthlyTransactionLimit, minimumBalance
- Status: status (active|inactive|frozen|closed)
- Joint: isJointAccount, jointHolders[]

**Transaction Model**:
- ID: transactionId, referenceNumber
- Type: type (transfer|deposit|withdrawal|payment|fee|interest|reversal|adjustment)
- Accounts: fromAccount, toAccount (ObjectIds)
- Amount: amount (min: 0.01)
- Details: description, channel, thirdParty, billPayment
- Status & timestamps

**Loan Model** (inline definition):
- userId, loanType (personal|home|car|business)
- amount, tenure (months), interestRate, monthlyInstallment
- status (pending|approved|rejected|active|closed)
- Dates: applicationDate, approvedDate, disbursedDate
- purpose, collateral, outstandingAmount

### Mobile App Architecture

**Routing** (Expo Router):
- `(tabs)` - Home/Explore screens
- `(auth)` - Login/Signup
- `(transactions)` - Transfer/History
- `(account)` - Profile/Cards
- `(modals)` - Modal overlays

**Features** (`src/features/`):
- auth/ - Login/Signup components
- home/ - Dashboard
- cards/ - Card management
- transfers/ - Money transfer
- transactions/ - History
- profile/ - User profile

**Contexts**:
- Auth context with login/signup/logout (currently mocked)

### Web App Services

**AdminService Methods** (37+ endpoints):
- Dashboard: stats
- Users: list, get, status, verify
- Transactions: list, get, flag, export
- Loans: list, approve
- Cards: list, update status

**DashboardService Methods** (15+ endpoints):
- Dashboard: getData, analytics
- Transactions: list, export
- Accounts: list, balance, details
- Cards: list, details

---

## Critical Integration Points

### 1. Authentication Flow (Mobile Needs Implementation)
```
User → Mobile App → Backend (/api/auth/login)
              ↓
         Returns JWT token
              ↓
         Store in AsyncStorage
              ↓
         Include in all future requests
              ↓
         Use in Authorization header
```

### 2. API Service Layer Pattern (Mobile Needs)
```typescript
class TransactionService {
  baseURL = 'http://localhost:5000/api';
  
  getAuthHeaders() {
    const token = await AsyncStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
  }
  
  async getTransactions() {
    const response = await fetch(`${this.baseURL}/transactions`, {
      headers: await this.getAuthHeaders()
    });
    return response.json();
  }
}
```

### 3. Real-Time Notifications (WebSocket)
```javascript
// Socket.IO integration
io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });
});

// Emit to specific user
io.to(`user-${userId}`).emit('notification', data);
```

---

## Configuration & Deployment

### Environment Variables

**Backend** (.env):
```
PORT=5000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CLOUDINARY_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
MongoDB connection strings
Redis connection strings
```

**Frontend** (.env.local):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Mobile** (hardcoded or .env via expo):
```
Base URL: Currently uses localhost (needs configuration)
```

---

## Data Flow Patterns

### Query String Handling
```javascript
const params = { page: 1, limit: 10, sort: 'createdAt', search: '' };
const queryString = new URLSearchParams(params).toString();
const url = `${baseURL}/endpoint?${queryString}`;
```

### File Export (CSV)
```javascript
const response = await fetch(`${url}?format=csv`, headers);
const blob = await response.blob();
// Create download link and trigger download
```

### Pagination
```javascript
// All list endpoints support:
{
  "success": true,
  "count": 50,
  "page": 1,
  "limit": 10,
  "total": 500,
  "data": [...]
}
```

---

## Security Considerations

1. **Token Security**
   - JWT tokens in Authorization header
   - Stored in localStorage (web) / AsyncStorage (mobile)
   - No token refresh mechanism (needs implementation)

2. **Rate Limiting**
   - IP-based rate limiting on all `/api/*`
   - 100 requests per 15-minute window

3. **Input Validation**
   - express-validator for server-side validation
   - Pattern matching for phone, CNIC, IBAN
   - File type/size restrictions on uploads

4. **Data Protection**
   - Helmet.js for security headers
   - Password hashing with bcryptjs
   - CORS configured for specific origins

5. **File Uploads**
   - 5MB file size limit
   - Image type validation
   - Cloudinary for storage (CDN with transformations)

---

## Performance Considerations

1. **Caching**
   - Redis configured for backend
   - No client-side caching in web services
   - No caching strategy in mobile

2. **Database Indexing**
   - Recommend indexes on: userId, accountId, transactionId
   - Search/filter operations may need optimization

3. **Image Optimization**
   - Cloudinary transformations applied
   - Mobile needs image caching

4. **API Response**
   - No pagination limits enforced
   - Large result sets could cause memory issues

---

## Integration Checklist for Mobile

- [ ] Create API service layer (`src/services/`)
- [ ] Implement real authentication (replace mocks)
- [ ] Add AsyncStorage for token persistence
- [ ] Create services for each feature (auth, accounts, transactions, cards, loans)
- [ ] Implement error handling and user feedback
- [ ] Add loading states
- [ ] Implement real-time notifications via Socket.IO
- [ ] Add image caching/optimization
- [ ] Implement retry logic for failed requests
- [ ] Add offline support (if required)
- [ ] Add proper TypeScript types for all API responses
- [ ] Implement request interceptors for auth headers

---

## Summary Statistics

| Component | Status | Endpoints | Services | Features |
|-----------|--------|-----------|----------|----------|
| Backend | ✓ Complete | ~60+ | N/A | All implemented |
| Web | ✓ Complete | ~30 using | 2 classes | Admin + Dashboard |
| Mobile | 🔶 In Progress | 0 using | 0 classes | UI only, mocked auth |

---

## Document References

For detailed information, see:
- `PROJECT_OVERVIEW.md` - Full backend API breakdown
- `BACKEND_ROUTES_DETAILED.md` - JSON format of all routes
- `WEB_APP_SERVICES.md` - Web service implementations
- `MOBILE_APP_STATE.md` - Mobile app structure and gaps
