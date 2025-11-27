# HBL Mobile – Copilot Instructions

A React Native banking app built with Expo 54, Expo Router, and NativeWind (Tailwind CSS).

## Project Overview

This is part of a **three-tier HBL Banking Application**:

1. **`backend/`** – Node.js Express backend
   - REST API endpoints for all banking operations
   - Authentication, account management, transactions, loans, cards
   - Database integration with Redis caching and Cloudinary for file storage
   - Swagger documentation at `swagger.json` and `swagger.yaml`
   - Key routes: `/auth`, `/accounts`, `/transactions`, `/loans`, `/cards`, `/admin`, `/users`, `/branches`, `/reports`

2. **`hbl-clone/`** – React web application
   - Complete web implementation of HBL banking platform
   - Built with Vite, React, and Tailwind CSS
   - Fully integrated with Node.js backend
   - Includes customer dashboard and admin panels
   - Features: account management, transfers, loan applications, card management, reports

3. **`hbl-mobile/`** – React Native mobile application *(you are here)*
   - Replicates customer-facing functionality from `hbl-clone` to mobile
   - Uses same backend APIs as web application
   - Built with Expo 54, Expo Router, and NativeWind for iOS/Android/Web platforms
   - Focus: customer dashboard, transactions, transfers, account management, loans, cards

**Integration Pattern**: Both `hbl-clone` and `hbl-mobile` consume the same backend APIs, ensuring consistent data and functionality across platforms.

## Architecture & Routing

**Grouped routes** (Expo Router) with auth-based conditional rendering:

```
src/app/
├── _layout.tsx              # Root: renders auth context + ThemeProvider
├── (auth)/{login,signup}.tsx     # Shown when NOT authenticated
├── (tabs)/{index,explore}.tsx    # Tab nav (authenticated)
├── (account)/{profile,cards}.tsx # Stack with back button
├── (transactions)/{transfer,history}.tsx
└── (modals)/modal.tsx
```

**Key pattern**: `src/app/_layout.tsx` wraps app with `<AuthProvider>`, routes conditionally based on `user` state. See `ROUTING.md` for full guide.

## Feature Organization

**Always place screens in `src/features/{featureName}/`**, route files re-export:
- Feature: `src/features/auth/login.tsx`
- Router: `src/app/(auth)/login.tsx` → `export { default } from '@/src/features/auth/login'`

Type definitions live in `src/types/index.ts` (centralized).

## Styling: NativeWind Only

**Never use `StyleSheet.create()`**—always use NativeWind (Tailwind) classNames:

```typescript
// ✅ Correct
<View className="flex-1 bg-white dark:bg-background-dark px-4 py-6">
  <Text className="text-lg font-bold text-gray-900 dark:text-white">Title</Text>
</View>

// ❌ Never
const styles = StyleSheet.create({ container: { flex: 1 } });
<View style={styles.container} />
```

**Dark mode**: prefix classes with `dark:`, e.g., `bg-white dark:bg-background-dark`.

**HBL brand colors** (in `config/tailwind.config.js`):
- `hbl-green`, `hbl-blue`, `hbl-gold`
- Status: `success`, `warning`, `error`, `info`

**Global utilities** in `global.css`:
- Flex: `.flex-center`, `.flex-between`, `.flex-col-center`
- Cards: `.card-base`, `.card-elevated`
- Badges: `.badge-success`, `.badge-warning`, `.badge-error`
- Form: `.form-input`, `.form-input-focused`

## Authentication Flow

Context at `src/contexts/auth.tsx` provides:
- `useAuth()` hook: `{ user, isLoading, login(), signup(), logout(), isAuthenticated }`
- Root layout routes to `(auth)` if `!isAuthenticated`, else `(tabs)`

Example navigation:
```typescript
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <TouchableOpacity onPress={() => { logout(); router.push('/(auth)/login'); }}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
}
```

## Developer Workflow

**Start development:**
```bash
npm install       # Install deps
npm start         # Launch Expo dev server
```

**Run on device:**
```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

**Lint & type-check:**
```bash
npm run lint      # ESLint (Expo config)
```

**Reset project** (clears cache, moves app code):
```bash
npm run reset-project
```

## Import Paths

Always use `@/src/` prefix (configured in `tsconfig.json`):

```typescript
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/contexts/auth';
import { User } from '@/src/types';
```

## Common Patterns

**Navigate between groups:**
```typescript
router.push('/(auth)/login');
router.push('/(account)/profile');
router.push('/(transactions)/transfer');
router.push('/(modals)/modal');
```

**Pass route params:**
```typescript
router.push({
  pathname: '/(account)/profile',
  params: { userId: '123' }
});

// Access in screen:
import { useLocalSearchParams } from 'expo-router';
const { userId } = useLocalSearchParams<{ userId: string }>();
```

**UI Components** in `src/components/ui/`:
- `button.tsx`: variants (primary, secondary, outline, ghost), sizes
- `card.tsx`: flexible card layouts with dark mode
- `input.tsx`: text input with label, error, icon support

All support dark mode. See their files for prop interfaces.

## Documentation

- **`STRUCTURE.md`**: Detailed directory layout
- **`ROUTING.md`**: In-depth routing guide, deep linking, best practices
- **`NATIVEWIND_IMPLEMENTATION.md`**: Styling details, custom utilities

## Quick Checklist When Adding Features

- [ ] Create `src/features/{name}/` with components
- [ ] Create `src/app/{group}/{name}.tsx` that exports feature
- [ ] Add type definitions to `src/types/index.ts` if needed
- [ ] Use NativeWind classes (no StyleSheet)
- [ ] Add dark mode support (`dark:` prefix)
- [ ] Register route in group layout if new group
- [ ] Test navigation: `router.push('/path')`

---

**Last Updated:** November 2025
**TypeScript + Expo 54 + Expo Router 6 + NativeWind 4**
