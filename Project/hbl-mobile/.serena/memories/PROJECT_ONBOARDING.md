# HBL Mobile - Project Onboarding

## Project Purpose
React Native banking application built with Expo that replicates customer-facing functionality from `hbl-clone` (React web app) to mobile platforms (iOS/Android/Web). Part of a 3-tier system with `backend/` (Node.js API) and `hbl-clone/` (React web).

## Technology Stack
- **Framework**: React Native (Expo 54)
- **Language**: TypeScript 5.9
- **Build/Runtime**: Expo Router 6 (file-based routing), Metro bundler
- **Styling**: NativeWind 4 (Tailwind CSS for React Native) + global.css utilities
- **State Management**: React Context API (auth context at `src/contexts/auth.tsx`)
- **HTTP Client**: Axios 1.13 (available, services layer not yet implemented)
- **Storage**: @react-native-async-storage/async-storage (for token persistence)
- **Routing**: Expo Router with grouped routes (tabs, auth, account, transactions, modals)

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- Use `@/*` path aliases (configured in tsconfig.json)
- All components and services should be typed

### Styling with NativeWind
- **NEVER use StyleSheet.create()** - always use NativeWind classNames
- Dark mode: prefix classes with `dark:` (e.g., `bg-white dark:bg-background-dark`)
- HBL brand colors: `hbl-green`, `hbl-blue`, `hbl-gold`
- Global utilities in `global.css`: `.flex-center`, `.card-base`, `.badge-success`, etc.
- Example: `<View className="flex-1 bg-white dark:bg-background-dark px-4 py-6">`

### File Organization
- Features go in `src/features/{featureName}/` with components
- Route files in `src/app/{group}/{name}.tsx` re-export from features
- Type definitions centralized in `src/types/index.ts`
- API services in `src/lib/apiClient.ts` and `src/services/`

### Authentication & State
- Auth context provides `{ user, isLoading, login(), signup(), logout(), isAuthenticated }`
- Root layout (`src/app/_layout.tsx`) routes conditionally on `isAuthenticated`
- Tokens stored in AsyncStorage (not yet implemented)

## Important Commands

### Development
- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - ESLint check
- `npm run reset-project` - Clear cache and move app code

### Testing & Build
- No test command configured yet (consider adding Jest)
- No build command for production yet

## Project Structure
```
hbl-mobile/
├── src/
│   ├── app/                 # Expo Router file-based routing
│   │   ├── _layout.tsx      # Root layout with auth routing
│   │   ├── (tabs)/          # Tab navigation (authenticated)
│   │   ├── (auth)/          # Auth screens (unauthenticated)
│   │   ├── (account)/       # Account/profile screens
│   │   ├── (transactions)/  # Transaction screens
│   │   └── (modals)/        # Modal overlays
│   ├── features/            # Feature-specific components
│   ├── components/          # Reusable UI components
│   ├── contexts/            # Auth context provider
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities (apiClient.ts goes here)
│   ├── services/            # API service classes (auth.service.ts, etc.)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   └── constants/           # App constants
├── config/                  # Build configs (babel, tailwind, etc.)
├── app.json                 # Expo configuration
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json
```

## Key Files
- `src/app/_layout.tsx` - Root layout and auth-based routing
- `src/contexts/auth.tsx` - Auth context (currently mocked)
- `src/features/home/index.tsx` - Home page (needs balance integration)
- `tailwind.config.js` - Brand colors and custom utilities
- `global.css` - Global Tailwind utilities
- `app.json` - Expo app configuration (name, version, plugins, platforms)

## Current Issues to Fix
1. **Navigation**: Card taps navigate to non-existent routes
2. **Balance Display**: Home page shows hardcoded/mock balance, not real data from API
3. **Backend Integration**: No service layer for API calls (only mocked auth)
4. **State Management**: No proper state for user accounts, cards, transactions
5. **Token Storage**: No AsyncStorage integration for token persistence

## Next Steps
1. Activate Serena symbol tools to audit current implementation
2. Create API service layer with backend integration
3. Fix auth context with real API and token storage
4. Fix Home page balance display with real account data
5. Fix card navigation to valid routes with correct data passing
6. Implement all CRUD services (accounts, transactions, cards, loans)
