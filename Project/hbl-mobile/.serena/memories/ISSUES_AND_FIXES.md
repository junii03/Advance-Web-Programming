# HBL Mobile - Issues Found and Fixes Required

## Critical Issues

### 1. ❌ MISSING ROUTE GROUP REGISTRATION
**File**: `src/app/_layout.tsx`
**Problem**: The `(customer)` route group is used throughout the app but NOT registered in the Stack
- Many screens navigate to `/(customer)/...` routes
- App will crash when trying to navigate to these routes
- Examples: loans, settings, request-card, apply-loan, etc.

**Files that navigate to (customer)**:
- `src/features/home/index.tsx` - quickAction for Loans: `/(customer)/loans`
- `src/features/cards/index.tsx` - Request card button: `/(customer)/request-card`
- Card item press: `/(customer)/card-details` (ALSO DOESN'T EXIST)
- Home page notification: `/(customer)/notifications`
- Home page view all transactions: `/(customer)/transactions`
- Home page settings: `/(account)/profile` (EXISTS)

### 2. ❌ NON-EXISTENT ROUTE: card-details
**Files**: 
- `src/features/cards/index.tsx` - onPress handler

**Problem**: Card items tap to `/(customer)/card-details` which doesn't exist
- Needs to be created in `src/app/(customer)/card-details.tsx`
- Should show card details with options to block, change limits, etc.
- Should accept card ID as route param

### 3. ✓ HOME BALANCE DISPLAY (Likely OK)
**File**: `src/features/home/index.tsx`
**Status**: Code looks correct
- Calls `dashboardService.getDashboardData()`
- Uses `dashboardData.summary.totalBalance`
- Has proper loading/error states
- Possible issue: If balance is 0 or service returns null, display may appear empty
- Should verify backend is returning correct data

### 4. ✓ SERVICES ARE IMPLEMENTED
**Files**: `src/services/*.ts`
**Status**: All services have real API calls, not stubs
- Dashboard: getDashboardData(), getAnalytics(), etc.
- Card: getCards(), getCard(), blockCard(), updateCardLimits(), etc.
- Auth: login(), signup(), logout(), me(), etc.
- Account: getAccounts(), getAccount(), etc.
- Transaction: getTransactions(), createTransaction(), etc.
- Loan: getLoans(), getLoan(), applyLoan(), etc.

### 5. ✓ API CLIENT & ERROR HANDLING
**File**: `src/lib/apiClient.ts`
**Status**: Properly implemented with:
- Axios interceptors
- Auth token attachment
- 401 error handling with event emitter
- Error mapping to ApiError with codes
- Proper response/error type handling

### 6. ✓ AUTH CONTEXT
**File**: `src/contexts/auth.tsx`
**Status**: Properly implemented with:
- AsyncStorage token persistence
- Token refresh on app startup
- Proper error handling
- onUnauthorized event listener from apiClient

## Required Fixes (Priority Order)

### PRIORITY 1: Fix Route Registration
1. Register `(customer)` group in `src/app/_layout.tsx`
2. Verify all route groups are properly stacked

### PRIORITY 2: Create Missing Routes
1. Create `src/app/(customer)/_layout.tsx` - Stack layout for customer routes
2. Create `src/app/(customer)/card-details.tsx` - Card details screen with ID parameter
3. Create `src/app/(customer)/loans.tsx` - Loans list (re-export from features)
4. Create `src/app/(customer)/transactions.tsx` - Transactions list (re-export from features)
5. Create `src/app/(customer)/request-card.tsx` - Request card form (re-export from features)
6. Create `src/app/(customer)/apply-loan.tsx` - Apply loan form (re-export from features)
7. Create `src/app/(customer)/settings.tsx` - Settings screen (re-export from features)
8. Create `src/app/(customer)/notifications.tsx` - Notifications screen (re-export from features)

### PRIORITY 3: Create Card Details Feature
1. Create `src/features/cards/card-details.tsx` - Card detail view
2. Show card info with actions: block, change limits, report card
3. Accept cardId from route params and fetch card data

### PRIORITY 4: Test Backend Integration
1. Test auth flow: login → token stored → me() API works
2. Test balance display: getDashboardData() returns correct balance
3. Test card operations: getCards(), card details, actions

### PRIORITY 5: Verify State Management
1. Home page uses dashboardData state correctly
2. Card balance displays correctly
3. Auth state persists on app restart

## Files to Modify

1. `src/app/_layout.tsx` - Add (customer) group registration
2. Create `src/app/(customer)/` directory with:
   - _layout.tsx
   - card-details.tsx (new screen)
   - loans.tsx, transactions.tsx, request-card.tsx, apply-loan.tsx, settings.tsx, notifications.tsx

3. `src/features/cards/` - Create card-details.tsx component

## Verification Checklist

- [ ] App runs without route errors
- [ ] Can navigate to all routes without crashes
- [ ] Balance displays correctly on home page
- [ ] Card details show when tapping a card
- [ ] Can perform card actions (request, block, etc.)
- [ ] Auth flow works: login → dashboard → profile
- [ ] Token persists on app restart
- [ ] All backend integrations return data correctly
