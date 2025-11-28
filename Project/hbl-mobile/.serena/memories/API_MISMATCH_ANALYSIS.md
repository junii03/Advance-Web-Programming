# Backend API Mismatch Analysis

## Issue Summary

The mobile app services are calling endpoints that don't exist or return incorrect data structures. The backend is returning data that doesn't match what the mobile app expects.

## Problems Found

### 1. ❌ GET /api/cards/:id - DOESN'T EXIST
**Mobile expects**: `GET /api/cards/:id` to get single card details
**Backend has**: Only `GET /api/cards` (no single card endpoint)
**Impact**: Card details screen crashes with 404 error

**Backend routes actually available**:
- `GET /api/cards` - Get all cards ✓
- `POST /api/cards` - Request new card ✓
- `PUT /api/cards/:id/status` - Update card status (but expects different payload)
- `PUT /api/cards/:id/pin` - Update PIN
- `GET /api/cards/:id/transactions` - Get card transactions ✓

### 2. ❌ PUT /api/cards/:id/block - DOESN'T EXIST
**Mobile expects**: `PUT /api/cards/:id/block` with `{ blocked: boolean }`
**Backend has**: `PUT /api/cards/:id/status` expecting `{ status: 'active|blocked' }`
**Impact**: Block/unblock card actions will fail

### 3. ❌ PUT /api/cards/:id/limit - DOESN'T EXIST
**Mobile expects**: `PUT /api/cards/:id/limit` with `{ cardLimit, dailyLimit, monthlyLimit }`
**Backend likely**: Doesn't have this endpoint
**Impact**: Change limits feature won't work

### 4. ⚠️ Card Data Structure Mismatch
**Backend returns** (from GET /api/cards):
```
{
  cardNumber: '4532-****-****-1234',
  maskedCardNumber: '4532-****-****-1234',  // Backend returns both!
  cardType: 'debit|credit',
  cardStatus: 'active|blocked|pending|expired',
  expiryDate: Date,
  cardName: 'User Name',
  accountId: ObjectId,
  isContactless: boolean,
  cardLimit: number,
  availableLimit: number,
  createdAt: Date,
  account: {
    accountNumber,
    accountTitle,
    balance,
    formattedBalance
  }
}
```

**Mobile expects** (ApiCard interface):
```
{
  _id: string,  // MISSING in backend response!
  userId: string,  // MISSING in backend response!
  accountId: string,
  cardNumber: string,
  cardType: 'debit|credit',
  cardName: string,
  cardHolderName: string,  // Backend returns 'cardName' instead
  expiryDate: string (ISO),
  cvv?: string,
  cardStatus: 'active|blocked|pending|expired|cancelled',
  isContactless: boolean,
  cardLimit: number,
  availableLimit: number,
  dailyLimit: number,  // MISSING in backend!
  monthlyLimit: number,  // MISSING in backend!
  internationalEnabled: boolean,  // MISSING in backend!
  onlineTransactionsEnabled: boolean,  // MISSING in backend!
  createdAt: string (ISO),
  updatedAt: string (ISO)  // MISSING in backend!
}
```

### 5. ❌ GET /api/users/dashboard - Response Structure Mismatch
**Mobile expects**:
```
{
  success: true,
  data: {
    user: { ... },
    accounts: [ ... ],
    cards: [ ... ],
    loans: [ ... ],
    recentTransactions: [ ... ],
    summary: {
      totalBalance: number,
      totalAvailableBalance: number,
      accountCount: number,
      activeCards: number,
      pendingLoans: number,
      activeLoans: number
    }
  }
}
```

**Web app uses**: `GET /users/dashboard` (same endpoint)
**Current status**: Need to verify if backend returns correct structure

## Root Causes

1. **API Contract Not Enforced**: Mobile services define their own endpoint expectations that don't match backend implementation
2. **Backend Incomplete**: Missing several card endpoints (:id, /limit, /block)
3. **Data Transformation Missing**: Card data needs to be mapped from backend format to frontend format
4. **Missing Required Fields**: dailyLimit, monthlyLimit, internationalEnabled, onlineTransactionsEnabled, _id

## Solutions Required

### IMMEDIATE FIXES NEEDED

1. **Option A: Fix Mobile Services** (Recommended - align with backend reality)
   - Remove `getCard(cardId)` call - instead get from list and filter by ID
   - Fix `blockCard` to use correct endpoint `/cards/:id/status` with `{ status: 'blocked' }`
   - Fix `unblockCard` to use correct endpoint `/cards/:id/status` with `{ status: 'active' }`
   - Remove or stub `updateCardLimits` until backend implements it
   - Add data mapping layer to transform backend response to ApiCard format

2. **Option B: Fix Backend** (Requires backend changes)
   - Add `GET /api/cards/:id` endpoint
   - Add `PUT /api/cards/:id/block` endpoint (or fix mobile to use /status)
   - Add `PUT /api/cards/:id/limit` endpoint
   - Return complete card data with all required fields
   - Ensure response includes `_id` and `userId`

3. **Hybrid Approach** (Best)
   - Mobile: Create mapping layer to handle data transformation
   - Mobile: Fix service calls to match actual backend endpoints
   - Backend: Add missing endpoints if they're essential features
   - Both: Ensure consistent response format

## Data Fields That Need Mapping

```
Backend → Mobile
cardNumber → cardNumber
cardName → cardHolderName
null → _id (need to add)
null → userId (need to add)  
null → dailyLimit (need to add)
null → monthlyLimit (need to add)
null → internationalEnabled (need to add)
null → onlineTransactionsEnabled (need to add)
null → cvv (optional)
null → updatedAt (need to add)
```

## Next Steps

1. Get exact sample response from backend `/users/dashboard` endpoint
2. Get exact sample response from backend `/api/cards` endpoint
3. Decide whether to fix mobile or backend (or both)
4. Implement data transformation layer in mobile
5. Update service calls to match actual backend endpoints
6. Test all card operations work end-to-end
