# Mobile App (`hbl-mobile`) Current State

## Technology Stack
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Routing**: Expo Router (file-based routing in `src/app/`)
- **State Management**: React Context API (auth context)
- **HTTP Client**: Fetch API (no axios/service layer yet)

---

## Current Project Structure

### Directories
- `src/app/` - Expo Router file-based routing (screens)
- `src/screens/` - Screen components
- `src/components/` - Reusable UI components
- `src/contexts/` - Context providers (auth.tsx)
- `src/hooks/` - Custom hooks
- `src/lib/` - Utilities and helpers (empty currently)
- `src/services/` - API services (no services implemented yet)
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/features/` - Feature-specific components
- `src/constants/` - Constants and configuration
- `src/assets/` - Images, fonts, etc.

### Key Files
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration (baseUrl: ".")
- `tailwind.config.js` - NativeWind styling
- `nativewind-env.d.ts` - NativeWind type definitions
- `RESTRUCTURING_SUMMARY.md`, `ROUTING.md`, `STRUCTURE.md` - Documentation
- `NATIVEWIND_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md` - Setup docs

---

## Routing Structure (from `src/app/`)

### Tab Layout (`(tabs)`)
- `(tabs)/` - Home/Dashboard
- `(tabs)/explore` - Explore/Browse

### Authentication Routes (`(auth)`)
- `(auth)/login` - Login screen
- `(auth)/signup` - Sign up screen

### Transactions Routes (`(transactions)`)
- `(transactions)/transfer` - Transfer money
- `(transactions)/history` - View transaction history

### Account Routes (`(account)`)
- `(account)/profile` - User profile
- `(account)/cards` - Cards management

### Modals
- `(modals)/modal` - Generic modal component

---

## Current Authentication Implementation

### Auth Context (`src/contexts/auth.tsx`)

**State**:
- `user`: User | null
- `isLoading`: boolean
- `isAuthenticated`: boolean

**Methods**:
- `login(email, password)` - Currently mocked with 1s delay
  - Returns mock user with hardcoded data
  - No actual API call to backend
  
- `signup(userData)` - Currently mocked with 1.5s delay
  - Takes SignupData object
  - Returns mock user
  - No actual API call to backend
  
- `logout()` - Clears user state

**Issues**:
- ✗ No real API integration
- ✗ No token storage/retrieval
- ✗ No error handling
- ✗ No persisted authentication state
- ✗ No refresh token mechanism

---

## Implemented Screens

### Feature Components (`src/features/`)
1. **auth/** - Authentication screens
   - `login.tsx` - Login form component
   - `signup.tsx` - Sign up form component

2. **home/** - Dashboard screens
   - `index.tsx` - Home screen
   - `_tabs.tsx` - Tab navigation
   - `explore.tsx` - Explore screen

3. **cards/** - Card management
   - `cards.tsx` - View/manage cards

4. **transfers/** - Money transfer
   - `transfer.tsx` - Transfer form component

5. **transactions/** - Transaction history
   - `transactions.tsx` - Transaction list

6. **profile/** - User profile
   - `profile.tsx` - Profile screen

---

## UI Components (`src/components/`)

### Built-In Components
- `ui/button.tsx` - Button component
- `ui/input.tsx` - Input field
- `ui/card.tsx` - Card/container
- `ui/header.tsx` - Header component
- `ui/icon-symbol.tsx` - Icon rendering
- `ui/collapsible.tsx` - Expandable sections

### Layout Components
- `parallax-scroll-view.tsx` - Parallax scrolling
- `themed-view.tsx` - Themed container
- `themed-text.tsx` - Themed text
- `haptic-tab.tsx` - Tab with haptic feedback
- `external-link.tsx` - Link component

---

## Type Definitions (`src/types/`)

Current types likely include:
- `User` - User profile type with id, name, email, customerId, profileImage
- `SignupData` - Registration form data with firstName, lastName, email, etc.
- (Other types for Accounts, Transactions, Cards, Loans)

---

## Missing/Not Implemented

### API Integration Layer
- ✗ No service classes for API calls
- ✗ No configuration for API base URL
- ✗ No error handling/retry logic
- ✗ No response interceptors
- ✗ No request interceptors for auth headers

### Authentication
- ✗ No token storage (AsyncStorage)
- ✗ No token refresh mechanism
- ✗ No persistent login state
- ✗ No logout cleanup

### Features
- ✗ No actual account fetching
- ✗ No real transaction history
- ✗ No card management
- ✗ No transfer functionality
- ✗ No loan applications

### Error Handling
- ✗ No error boundaries
- ✗ No global error handler
- ✗ No retry mechanisms

### Performance
- ✗ No image caching
- ✗ No request caching
- ✗ No lazy loading

---

## Next Steps for Implementation

1. Create API service layer in `src/lib/` or `src/services/`
2. Add configuration with base URL, API constants
3. Implement real authentication with token storage
4. Add AsyncStorage for persistent auth state
5. Implement all CRUD operations for accounts, transactions, cards, loans
6. Add error handling and user feedback
7. Implement real-time notifications via Socket.IO
8. Add image handling/caching
