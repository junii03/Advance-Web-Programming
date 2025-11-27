# HBL Banking Application - Project Overview

## Project Structure
This is a full-stack banking application with three main components:

1. **Backend**: Node.js/Express REST API (port 5000)
2. **hbl-clone**: React web application (Vite-based, port 5173)
3. **hbl-mobile**: React Native mobile app (Expo-based)

## Backend API Configuration

### Base URLs
- **Production**: `http://localhost:8000/api` (configured via `VITE_API_BASE_URL`)
- **Development**: `http://localhost:5000` (Express default, fallback used in some services)
- **API Docs**: Available at `/api-docs` (Swagger UI)
- **Health Check**: `GET /health` returns API status

### Port Configuration
- Backend runs on: `PORT` env var (default: 5000)
- Frontend (hbl-clone) runs on: 5173
- CORS enabled from `CORS_ORIGIN` env var

### Technology Stack
**Backend**: Express, MongoDB (Mongoose), Redis, Socket.IO, JWT Auth, Multer for uploads
**Frontend Web**: React 18, Vite, Tailwind CSS
**Mobile**: React Native, Expo, TypeScript, NativeWind

---

## Backend API Routes Structure

### 1. Authentication Routes (`/api/auth`)
**Endpoints**:
- `POST /api/auth/register` - Register new user with documents (multipart/form-data)
  - Required: firstName, lastName, email, password, phone, cnic, dateOfBirth, gender, address
  - Files: profilePicture, cnicFront, cnicBack (to Cloudinary)
  - Returns: user object + JWT token
  
- `POST /api/auth/login` - Login (email + password)
  - Required: email, password
  - Returns: JWT token + user profile
  - Authentication: None (public)
  
- `POST /api/auth/logout` - Logout user
  - Authentication: Bearer token (protected)
  
- `GET /api/auth/me` - Get current authenticated user
  - Authentication: Bearer token (protected)
  
- `PUT /api/auth/updatedetails` - Update profile details
  - Updates: firstName, lastName, phone, address fields
  - Authentication: Bearer token (protected)
  
- `PUT /api/auth/updatepassword` - Change password
  - Required: currentPassword, newPassword
  - Authentication: Bearer token (protected)

---

### 2. Accounts Routes (`/api/accounts`)
**Endpoints**:
- `GET /api/accounts` - Get all user accounts
  - Filters: Only non-closed accounts
  - Returns: Array of account objects
  - Authentication: Bearer token
  
- `GET /api/accounts/{id}` - Get single account details
  - Returns: Account with full details (balance, limits, status)
  - Authentication: Bearer token
  
- Plus endpoints for account creation, updating, closing, etc.

**Account Model Fields**:
- accountNumber (unique, 10-16 digits)
- iban (PK format)
- userId (reference)
- accountType: savings, current, fixed_deposit, islamic_savings, salary
- accountTitle, balance, availableBalance
- dailyTransactionLimit, monthlyTransactionLimit, minimumBalance
- status: active, inactive, frozen, closed
- isJointAccount, jointHolders[]

---

### 3. Transactions Routes (`/api/transactions`)
**Endpoints**:
- `POST /api/transactions` - Create transaction (transfer/payment/withdrawal)
  - Required: type, fromAccountId, amount, description
  - Optional: toAccountId (for transfers), thirdParty, billPayment details
  - Types: transfer, payment, withdrawal
  - SubTypes: online_transfer, external_transfer, atm_withdrawal, branch_deposit, mobile_payment, bill_payment, salary_credit, merchant_payment, card_payment
  - Channel: online, mobile, atm, branch
  - Authentication: Bearer token
  
- Plus endpoints for transaction history, filtering, export, etc.

**Transaction Model Fields**:
- transactionId (unique), referenceNumber (unique)
- type, subType
- fromAccount, toAccount (ObjectIds)
- amount (min: 0.01)
- status, timestamps

---

### 4. Cards Routes (`/api/cards`)
**Endpoints**:
- `GET /api/cards` - Get user's cards
  - Returns: Array of card objects with masked numbers
  
- Card operations (request, activate, block, etc.)

**Card Fields**:
- cardNumber (masked: 4532-****-****-1234)
- cardType: debit, credit
- cardStatus: active, blocked, pending, expired
- expiryDate, cardName
- accountId (reference)
- isContactless, cardLimit, availableLimit

---

### 5. Loans Routes (`/api/loans`)
**Endpoints**:
- `GET /api/loans` - Get user's loans
  - Returns: Array of loan applications
  - Authentication: Bearer token
  
- `POST /api/loans` - Apply for loan
  - Required: loanType, amount, tenure, purpose
  - LoanTypes: personal, home, car, business
  - Authentication: Bearer token
  
- `GET /api/loans/{id}` - Get loan details
  - Authentication: Bearer token
  
- `POST /api/loans/calculate` - Calculate loan EMI/details
  - Required: amount, tenure, loanType
  - Returns: interestRate, monthlyInstallment, totalAmount, etc.
  - Authentication: Bearer token

**Loan Model Fields**:
- userId, loanType, amount, tenure (months)
- interestRate, monthlyInstallment
- status: pending, approved, rejected, active, closed
- applicationDate, approvedDate, disbursedDate
- purpose, collateral, outstandingAmount

---

### 6. Users Routes (`/api/users`)
**Endpoints**:
- `GET /api/users/profile` - Get current user profile
  - Authentication: Bearer token
  
- `PUT /api/users/profile` - Update user profile
  - Updates: firstName, lastName, phone, address
  - Authentication: Bearer token
  
- `GET /api/users/dashboard` - Get dashboard data (web service)
- `GET /api/users/analytics` - Get analytics with time period parameter
- `GET /api/users/transactions` - Get transactions with filters/pagination
- `GET /api/users/export-transactions` - Export transactions (CSV)

**User Model Fields**:
- firstName, lastName, email, phone, cnic
- dateOfBirth, gender
- address: {street, city, state, postalCode, country}
- password (hashed, select: false)
- role: customer, employee, manager, admin
- isActive, isEmailVerified, isPhoneVerified
- profilePicture (Cloudinary URL)
- Timestamps, KYC/verification fields

---

### 7. Admin Routes (`/api/admin`)
**Endpoints**:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}/status` - Update user active status
- `PUT /api/admin/users/{id}/verify` - Update email/phone verification
- `GET /api/admin/transactions` - Get all transactions
- `PUT /api/admin/transactions/{id}/flag` - Flag transaction
- `GET /api/admin/transactions/export` - Export transactions
- `GET /api/admin/loans` - Get all loan applications
- `PUT /api/admin/loans/{id}/approve` - Approve/reject loans
- `GET /api/admin/cards` - Get all cards
- All require admin role authentication

---

### 8. Other Routes
**Branches** (`/api/branches`):
- `GET /api/branches` - Get all branches
- `GET /api/branches/{id}` - Get branch details
- `GET /api/branches/nearby` - Find nearby branches (location-based)
- `GET /api/branches/atms` - Get ATM locations

**Notifications** (`/api/notifications`):
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

**Uploads** (`/api/uploads`):
- `POST /api/uploads/profile-picture` - Upload profile picture
- `POST /api/uploads/document` - Upload document
- `GET /api/uploads/documents` - Get user documents
- `DELETE /api/uploads/document/{id}` - Delete document
- `POST /api/uploads/file` - Generic file upload
- `DELETE /api/uploads/profile-picture` - Delete profile picture

**Reports** (`/api/reports`):
- Various reporting endpoints for transactions, accounts, etc.

---

## Authentication & Security

### JWT Authentication
- Header: `Authorization: Bearer {token}`
- Token stored in localStorage (web), likely async storage (mobile)
- Protected routes use `protect` middleware from `middleware/auth.js`
- Admin routes use `protect` + `authorize` middleware

### Rate Limiting
- Enabled on `/api/` routes
- Default: 100 requests per 15 minutes
- Configurable via: `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

### Security Headers
- Helmet.js for security headers
- CORS configured for frontend URLs
- Content Security Policy enabled
- HTTPS recommended for production

---

## Media Handling

### Cloudinary Integration
- Profile pictures: Stored in `hbl-banking/profile_pictures`
- Documents: Stored in `hbl-banking/documents`
- Auto-transformation: Resizing, quality optimization
- Multer limits: 5MB max file size
- Supported: Image files only for profiles

### Environment Variables Required
- `CLOUDINARY_NAME`: Cloudinary account name
- `CLOUDINARY_API_KEY`: API key
- `CLOUDINARY_API_SECRET`: API secret
- `CORS_ORIGIN`: Frontend URL
- `PORT`: Server port
- `RATE_LIMIT_WINDOW_MS`: Rate limit window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests allowed

---

## WebSocket (Socket.IO)
- Real-time notifications and updates
- Event: `join-user-room` (userId) - User joins their notification room
- Rooms: `user-{userId}` for targeted notifications
- Configuration: CORS enabled, credentials required

---

## Database Models
1. **User**: Core user profile, authentication, KYC
2. **Account**: Bank accounts linked to users
3. **Transaction**: All account transactions/transfers
4. **Loan**: Loan applications and tracking
5. Additional models for Cards, Notifications, etc. (in routes)

---

## API Response Format
Standard response structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "count": 1
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description"
}
```
