# Backend Routes Structure (JSON Format)

## Complete API Endpoint Mapping

```json
{
  "/api/auth": {
    "POST /register": {
      "purpose": "Register new user with KYC documents",
      "auth": "none",
      "contentType": "multipart/form-data",
      "required": [
        "firstName", "lastName", "email", "password", "phone", "cnic",
        "dateOfBirth", "gender", "address (object)",
        "profilePicture (file)", "cnicFront (file)", "cnicBack (file)"
      ],
      "returns": { "success": true, "token": "JWT", "user": {} }
    },
    "POST /login": {
      "purpose": "Authenticate user and get JWT token",
      "auth": "none",
      "contentType": "application/json",
      "required": ["email", "password"],
      "returns": { "success": true, "token": "JWT", "user": {} }
    },
    "POST /logout": {
      "purpose": "Logout and invalidate session",
      "auth": "Bearer token",
      "contentType": "application/json",
      "required": [],
      "returns": { "success": true }
    },
    "GET /me": {
      "purpose": "Get current authenticated user profile",
      "auth": "Bearer token",
      "returns": { "success": true, "data": {} }
    },
    "PUT /updatedetails": {
      "purpose": "Update user profile information",
      "auth": "Bearer token",
      "contentType": "application/json",
      "optional": ["firstName", "lastName", "phone", "address"],
      "returns": { "success": true, "data": {} }
    },
    "PUT /updatepassword": {
      "purpose": "Change user password",
      "auth": "Bearer token",
      "contentType": "application/json",
      "required": ["currentPassword", "newPassword"],
      "returns": { "success": true }
    }
  },

  "/api/accounts": {
    "GET /": {
      "purpose": "Get all active accounts for authenticated user",
      "auth": "Bearer token",
      "filters": "none",
      "returns": { "success": true, "count": 3, "data": [{}] }
    },
    "GET /:id": {
      "purpose": "Get single account with full details",
      "auth": "Bearer token",
      "parameters": { "id": "account ObjectId" },
      "returns": { "success": true, "data": {} }
    },
    "POST /": {
      "purpose": "Create new account",
      "auth": "Bearer token",
      "required": ["accountType", "accountTitle"],
      "accountTypes": ["savings", "current", "fixed_deposit", "islamic_savings", "salary"],
      "returns": { "success": true, "data": {} }
    },
    "PUT /:id": {
      "purpose": "Update account details",
      "auth": "Bearer token",
      "optional": ["accountTitle", "dailyTransactionLimit", "monthlyTransactionLimit"],
      "returns": { "success": true, "data": {} }
    },
    "DELETE /:id": {
      "purpose": "Close/delete account",
      "auth": "Bearer token",
      "returns": { "success": true }
    }
  },

  "/api/transactions": {
    "POST /": {
      "purpose": "Create transaction (transfer/payment/withdrawal)",
      "auth": "Bearer token",
      "contentType": "application/json",
      "required": ["type", "fromAccountId", "amount", "description"],
      "optional": ["toAccountId", "channel", "thirdParty", "billPayment"],
      "types": ["transfer", "payment", "withdrawal"],
      "channels": ["online", "mobile", "atm", "branch"],
      "subTypes": [
        "online_transfer", "external_transfer", "atm_withdrawal", 
        "branch_deposit", "mobile_payment", "bill_payment", 
        "salary_credit", "merchant_payment", "card_payment"
      ],
      "returns": { "success": true, "data": { "transactionId": "", "status": "" } }
    },
    "GET /": {
      "purpose": "Get transaction history with filters",
      "auth": "Bearer token",
      "filters": {
        "dateFrom": "ISO date",
        "dateTo": "ISO date",
        "type": "transaction type",
        "status": "pending|success|failed",
        "accountId": "filter by account",
        "page": "pagination",
        "limit": "results per page"
      },
      "returns": { "success": true, "count": 50, "data": [{}] }
    },
    "GET /:id": {
      "purpose": "Get single transaction details",
      "auth": "Bearer token",
      "returns": { "success": true, "data": {} }
    },
    "POST /:id/verify": {
      "purpose": "Verify OTP for transaction",
      "auth": "Bearer token",
      "required": ["otp"],
      "returns": { "success": true, "status": "verified" }
    }
  },

  "/api/cards": {
    "GET /": {
      "purpose": "Get user's all cards (debit/credit)",
      "auth": "Bearer token",
      "returns": { "success": true, "count": 2, "data": [{}] }
    },
    "GET /:id": {
      "purpose": "Get card details with masked number",
      "auth": "Bearer token",
      "returns": { "success": true, "data": {} }
    },
    "POST /": {
      "purpose": "Request new card",
      "auth": "Bearer token",
      "required": ["accountId", "cardType"],
      "cardTypes": ["debit", "credit"],
      "optional": ["isContactless"],
      "returns": { "success": true, "data": { "status": "pending" } }
    },
    "PUT /:id/block": {
      "purpose": "Block/unblock card",
      "auth": "Bearer token",
      "required": ["blocked"],
      "returns": { "success": true, "data": { "cardStatus": "blocked" } }
    },
    "PUT /:id/limit": {
      "purpose": "Update card spending limit",
      "auth": "Bearer token",
      "required": ["cardLimit"],
      "returns": { "success": true, "data": {} }
    }
  },

  "/api/loans": {
    "GET /": {
      "purpose": "Get all user loan applications",
      "auth": "Bearer token",
      "returns": { "success": true, "count": 2, "data": [{}] }
    },
    "GET /:id": {
      "purpose": "Get loan application details",
      "auth": "Bearer token",
      "returns": { "success": true, "data": {} }
    },
    "POST /": {
      "purpose": "Apply for new loan",
      "auth": "Bearer token",
      "required": ["loanType", "amount", "tenure", "purpose"],
      "loanTypes": ["personal", "home", "car", "business"],
      "tenureUnit": "months",
      "returns": { "success": true, "data": { "status": "pending" } }
    },
    "POST /calculate": {
      "purpose": "Calculate loan EMI and details",
      "auth": "Bearer token",
      "required": ["amount", "tenure", "loanType"],
      "returns": {
        "success": true,
        "data": {
          "monthlyInstallment": 5000,
          "totalAmount": 150000,
          "totalInterest": 20000,
          "interestRate": 8.5
        }
      }
    }
  },

  "/api/users": {
    "GET /profile": {
      "purpose": "Get current user profile",
      "auth": "Bearer token",
      "returns": { "success": true, "data": {} }
    },
    "PUT /profile": {
      "purpose": "Update user profile",
      "auth": "Bearer token",
      "optional": ["firstName", "lastName", "phone", "address"],
      "returns": { "success": true, "data": {} }
    },
    "GET /dashboard": {
      "purpose": "Get dashboard data (web service)",
      "auth": "Bearer token",
      "returns": { "success": true, "data": { "accounts": [], "recentTransactions": [], "cards": [] } }
    },
    "GET /analytics": {
      "purpose": "Get analytics/statistics",
      "auth": "Bearer token",
      "query": { "period": "6months|1year|all" },
      "returns": { "success": true, "data": {} }
    },
    "GET /transactions": {
      "purpose": "Get user transactions with advanced filters",
      "auth": "Bearer token",
      "query": {
        "dateFrom": "ISO date",
        "dateTo": "ISO date",
        "type": "filter",
        "status": "filter",
        "page": "pagination",
        "limit": "items per page"
      },
      "returns": { "success": true, "count": 50, "data": [{}] }
    },
    "GET /export-transactions": {
      "purpose": "Export transactions",
      "auth": "Bearer token",
      "query": { "format": "csv|pdf|json", "dateFrom": "", "dateTo": "" },
      "returns": "File download (Blob)"
    }
  },

  "/api/admin": {
    "GET /stats": {
      "purpose": "Get dashboard statistics",
      "auth": "Bearer token + admin role",
      "returns": { "success": true, "data": { "totalUsers": 1000, "totalTransactions": 5000 } }
    },
    "GET /users": {
      "purpose": "Get all users (paginated)",
      "auth": "Bearer token + admin role",
      "query": { "page": 1, "limit": 10, "sort": "createdAt", "search": "" },
      "returns": { "success": true, "count": 1000, "data": [{}] }
    },
    "GET /users/:id": {
      "purpose": "Get user details",
      "auth": "Bearer token + admin role",
      "returns": { "success": true, "data": {} }
    },
    "PUT /users/:id/status": {
      "purpose": "Activate/deactivate user",
      "auth": "Bearer token + admin role",
      "required": ["isActive"],
      "returns": { "success": true }
    },
    "PUT /users/:id/verify": {
      "purpose": "Verify email/phone",
      "auth": "Bearer token + admin role",
      "body": { "verifyEmail": true, "verifyPhone": true },
      "returns": { "success": true }
    },
    "GET /transactions": {
      "purpose": "Get all transactions (admin view)",
      "auth": "Bearer token + admin role",
      "query": { "page": 1, "limit": 10, "status": "", "type": "" },
      "returns": { "success": true, "count": 5000, "data": [{}] }
    },
    "GET /transactions/:id": {
      "purpose": "Get transaction details",
      "auth": "Bearer token + admin role",
      "returns": { "success": true, "data": {} }
    },
    "PUT /transactions/:id/flag": {
      "purpose": "Flag suspicious transaction",
      "auth": "Bearer token + admin role",
      "required": ["flagged"],
      "optional": ["flagReason"],
      "returns": { "success": true }
    },
    "GET /transactions/export": {
      "purpose": "Export all transactions",
      "auth": "Bearer token + admin role",
      "query": { "format": "csv", "dateFrom": "", "dateTo": "" },
      "returns": "File download"
    },
    "GET /loans": {
      "purpose": "Get all loan applications",
      "auth": "Bearer token + admin role",
      "query": { "status": "pending|approved|rejected", "page": 1, "limit": 10 },
      "returns": { "success": true, "count": 100, "data": [{}] }
    },
    "PUT /loans/:id/approve": {
      "purpose": "Approve/reject loan application",
      "auth": "Bearer token + admin role",
      "required": ["action"],
      "optional": ["rejectionReason"],
      "actions": ["approve", "reject"],
      "returns": { "success": true }
    },
    "GET /cards": {
      "purpose": "Get all user cards",
      "auth": "Bearer token + admin role",
      "returns": { "success": true, "count": 500, "data": [{}] }
    },
    "PUT /cards/:cardId/status": {
      "purpose": "Update card status",
      "auth": "Bearer token + admin role",
      "required": ["status"],
      "optional": ["reason", "adminNotes"],
      "statuses": ["active", "blocked", "pending", "expired"],
      "returns": { "success": true }
    }
  },

  "/api/branches": {
    "GET /": {
      "purpose": "Get all branches",
      "auth": "none",
      "query": { "page": 1, "limit": 10 },
      "returns": { "success": true, "count": 50, "data": [{}] }
    },
    "GET /:id": {
      "purpose": "Get branch details",
      "auth": "none",
      "returns": { "success": true, "data": {} }
    },
    "GET /nearby": {
      "purpose": "Find nearby branches (location-based)",
      "auth": "none",
      "query": { "latitude": 24.8607, "longitude": 67.0011, "radius": 5 },
      "radiusUnit": "kilometers",
      "returns": { "success": true, "data": [{}] }
    },
    "GET /atms": {
      "purpose": "Get ATM locations",
      "auth": "none",
      "query": { "latitude": 24.8607, "longitude": 67.0011, "radius": 5 },
      "returns": { "success": true, "data": [{}] }
    }
  },

  "/api/notifications": {
    "GET /": {
      "purpose": "Get user notifications",
      "auth": "Bearer token",
      "query": { "unread": false, "page": 1, "limit": 20 },
      "returns": { "success": true, "count": 50, "data": [{}] }
    },
    "PUT /:id/read": {
      "purpose": "Mark notification as read",
      "auth": "Bearer token",
      "returns": { "success": true }
    },
    "PUT /read-all": {
      "purpose": "Mark all notifications as read",
      "auth": "Bearer token",
      "returns": { "success": true }
    },
    "DELETE /:id": {
      "purpose": "Delete notification",
      "auth": "Bearer token",
      "returns": { "success": true }
    },
    "GET /unread-count": {
      "purpose": "Get unread notification count",
      "auth": "Bearer token",
      "returns": { "success": true, "data": { "unreadCount": 5 } }
    }
  },

  "/api/uploads": {
    "POST /profile-picture": {
      "purpose": "Upload user profile picture",
      "auth": "Bearer token",
      "contentType": "multipart/form-data",
      "file": "image only, max 5MB",
      "returns": { "success": true, "data": { "url": "cloudinary_url" } }
    },
    "POST /document": {
      "purpose": "Upload KYC/ID document",
      "auth": "Bearer token",
      "contentType": "multipart/form-data",
      "required": ["documentType"],
      "file": "image only, max 5MB",
      "returns": { "success": true, "data": { "url": "cloudinary_url" } }
    },
    "GET /documents": {
      "purpose": "Get user uploaded documents",
      "auth": "Bearer token",
      "returns": { "success": true, "data": [{}] }
    },
    "DELETE /document/:documentId": {
      "purpose": "Delete uploaded document",
      "auth": "Bearer token",
      "returns": { "success": true }
    },
    "POST /file": {
      "purpose": "Generic file upload",
      "auth": "Bearer token",
      "contentType": "multipart/form-data",
      "returns": { "success": true, "data": { "url": "" } }
    },
    "DELETE /profile-picture": {
      "purpose": "Delete profile picture",
      "auth": "Bearer token",
      "returns": { "success": true }
    }
  },

  "/api/reports": {
    "": "Various reporting endpoints for transactions, accounts, etc. - details to be documented"
  }
}
```

---

## Configuration Details

### Base API URL
- **Environment Variable**: `VITE_API_BASE_URL` (frontend), process.env.API_BASE_URL or PORT
- **Default/Fallback**: 
  - Backend: `http://localhost:5000` (from PORT or 5000)
  - Frontend fallback: `http://localhost:8000/api`
  - Production: Configured via environment variables

### Backend Port
- **Environment Variable**: `PORT`
- **Default**: 5000
- **Frontend CORS Origin**: Configured via `CORS_ORIGIN` env var (default: http://localhost:5173)

### Authentication Pattern
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Token Storage** (web): `localStorage.getItem('token')`
- **Token Storage** (mobile): AsyncStorage (not yet implemented)

### Rate Limiting
- **Window**: 15 minutes (default, configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests**: 100 per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Applies To**: All `/api/*` routes

### File Uploads
- **Storage**: Cloudinary (cloud-based)
- **Max File Size**: 5MB
- **Allowed Types**: Image files only
- **Profile Pictures**: Resized to 300x300px
- **Documents**: Resized to 800px width
