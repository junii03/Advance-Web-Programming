# HBL Banking Backend API

A comprehensive Node.js backend system for a modern banking application with full-featured account management, transaction processing, and administrative capabilities.

## Features

### Core Banking Features
- **User Management**: Registration, authentication, profile management
- **Account Management**: Multiple account types (Savings, Current, Fixed Deposit, Islamic Savings, Salary)
- **Transaction Processing**: Real-time fund transfers, deposits, withdrawals
- **Card Management**: Debit/Credit card issuance and management
- **Loan System**: Loan applications, EMI calculations, approval workflow
- **Branch Locator**: Find nearest branches and ATMs
- **Notifications**: Real-time notifications with Socket.IO

### Security & Compliance
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Customer, Employee, Manager, Admin roles
- **Rate Limiting**: API rate limiting for security
- **Account Lockout**: Failed login attempt protection
- **Transaction Monitoring**: Fraud detection and flagging
- **Audit Logging**: Comprehensive logging with Winston

### Administrative Features
- **Admin Dashboard**: System statistics and monitoring
- **User Management**: User status control and account oversight
- **Transaction Monitoring**: Real-time transaction oversight
- **System Reports**: Detailed analytics and reporting

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Real-time**: Socket.IO
- **Logging**: Winston
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer + Cloudinary

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18.0.0 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6.0 or higher)
- npm or yarn package manager

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Environment Variables
Configure the following environment variables in your `.env` file:

```env
# Basic Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/hbl_banking_db
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=24h

# Security
BCRYPT_SALT_ROUNDS=12

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 5. Start Required Services
```bash
# Start MongoDB (if not running as service)
mongod

# Start Redis (if not running as service)
redis-server
```

### 6. Seed Database (Optional)
```bash
npm run seed
```

### 7. Start the Server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Swagger Documentation (Password Protected)

For complete interactive API documentation, visit:
```
http://localhost:8000/api-docs
```

**Authentication Required:**
- Username: (Set in `SWAGGER_USERNAME` environment variable)
- Password: (Set in `SWAGGER_PASSWORD` environment variable)
- Default credentials: `admin` / `change_this_password`

When accessing `/api-docs`, your browser will prompt for credentials. Enter the username and password configured in your `.env` file.

**Note:** The Swagger documentation is password-protected for security. Make sure to update the default credentials in production environments.

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints
```
POST /auth/register          - User registration
POST /auth/login             - User login
POST /auth/logout            - User logout
GET  /auth/me                - Get current user
PUT  /auth/updatedetails     - Update user details
PUT  /auth/updatepassword    - Change password
POST /auth/forgotpassword    - Request password reset
PUT  /auth/resetpassword/:token - Reset password
```

### Account Management
```
GET  /accounts               - Get user accounts
POST /accounts               - Create new account
GET  /accounts/:id           - Get account details
PUT  /accounts/:id           - Update account
GET  /accounts/:id/balance   - Get account balance
GET  /accounts/:id/transactions - Get account transactions
```

### Transaction Management
```
GET  /transactions           - Get user transactions
POST /transactions           - Create transaction (transfer/payment)
GET  /transactions/:id       - Get transaction details
GET  /transactions/:id/receipt - Get transaction receipt
PUT  /transactions/:id/cancel - Cancel pending transaction
```

### Card Management
```
GET  /cards                  - Get user cards
POST /cards                  - Request new card
PUT  /cards/:id/status       - Block/unblock card
PUT  /cards/:id/pin          - Set card PIN
```

### Loan Management
```
GET  /loans                  - Get user loans
POST /loans                  - Apply for loan
GET  /loans/:id              - Get loan details
POST /loans/calculate        - Calculate EMI
```

### Branch & ATM Locator
```
GET  /branches               - Get all branches
GET  /branches/:id           - Get branch details
GET  /branches/nearby        - Find nearby branches
GET  /branches/atms          - Get ATM locations
```

### User Profile
```
GET  /users/profile          - Get user profile
PUT  /users/profile          - Update profile
GET  /users/dashboard        - Get dashboard data
GET  /users/beneficiaries    - Get beneficiaries
```

### Notifications
```
GET  /notifications          - Get notifications
PUT  /notifications/:id/read - Mark as read
PUT  /notifications/read-all - Mark all as read
DELETE /notifications/:id    - Delete notification
```

### Admin Endpoints (Admin/Manager only)
```
GET  /admin/stats            - Dashboard statistics
GET  /admin/users            - Get all users
GET  /admin/users/:id        - Get user details
PUT  /admin/users/:id/status - Update user status
GET  /admin/transactions     - Get all transactions
PUT  /admin/transactions/:id/flag - Flag transaction
GET  /admin/reports/:type    - Generate reports
```

## Database Schema

### Users Collection
- Personal information (name, email, phone, CNIC)
- Address and contact details
- Authentication credentials
- Account status and verification
- Security settings (login attempts, lockout)
- Preferences and settings

### Accounts Collection
- Account identification (number, IBAN)
- Account type and status
- Balance and limits
- Branch information
- Interest rates and terms
- Joint account support

### Transactions Collection
- Transaction identification and reference
- Source and destination accounts
- Amount and currency
- Transaction type and status
- Device and location information
- Fees and charges
- Approval workflow

## Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **Token Blacklisting**: Redis-based token revocation
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic lockout after failed attempts
- **Helmet Security**: HTTP header security
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: Security event logging

## Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Request Logging**: HTTP request/response logging
- **Error Handling**: Centralized error handling
- **Health Checks**: System health monitoring
- **Performance Metrics**: Transaction and system metrics

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t hbl-banking-backend .

# Run container
docker run -p 5000:5000 --env-file .env hbl-banking-backend
```

### Production Considerations
- Use environment-specific configuration
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx)
- Set up monitoring and alerting
- Regular database backups
- Security audits and updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Performance

- **Database Indexing**: Optimized MongoDB indexes
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: MongoDB connection pooling
- **Compression**: HTTP response compression
- **Rate Limiting**: API rate limiting for stability

## Development

### Project Structure
```
backend/
├── src/
│   ├── app.js              # Main application file
│   ├── config/             # Configuration files
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── scripts/           # Database scripts
├── logs/                  # Log files
├── package.json           # Dependencies
└── README.md             # This file
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Features in Detail

### Real-time Features
- Live transaction notifications
- Real-time balance updates
- Instant alert system
- WebSocket connections

### Banking Operations
- Inter-bank transfers
- Bill payments
- Account statements
- Transaction history
- Fund management

### Administrative Tools
- User management dashboard
- Transaction monitoring
- System analytics
- Report generation
- Audit trails

---

**Made with ❤️ for secure and efficient banking operations**
