# HBL Mobile - Project Structure Guide

## 📁 Folder Organization

```
hbl-mobile/
├── src/                          # Source code directory
│   ├── app/                      # Expo Router entry points and route configuration
│   │   ├── _layout.tsx          # Root layout with Auth & Navigation setup
│   │   ├── login.tsx            # Login route
│   │   ├── signup.tsx           # Signup route
│   │   ├── cards.tsx            # Cards route
│   │   ├── profile.tsx          # Profile route
│   │   ├── transfer.tsx         # Transfer route
│   │   ├── transactions.tsx     # Transactions route
│   │   └── (tabs)/              # Tab navigation routes
│   │       ├── _layout.tsx      # Tab layout configuration
│   │       ├── index.tsx        # Home tab
│   │       └── explore.tsx      # Explore tab
│   │
│   ├── features/                 # Feature-based modules
│   │   ├── auth/                # Authentication feature
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── index.ts
│   │   ├── home/                # Home/Dashboard feature
│   │   │   ├── index.tsx
│   │   │   ├── explore.tsx
│   │   │   └── _tabs.tsx
│   │   ├── cards/               # Cards management feature
│   │   ├── transfers/           # Money transfers feature
│   │   ├── transactions/        # Transaction history feature
│   │   └── profile/             # User profile feature
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── header.tsx
│   │   │   └── ...
│   │   ├── haptic-tab.tsx
│   │   ├── parallax-scroll-view.tsx
│   │   └── ...
│   │
│   ├── contexts/                # React Context providers
│   │   └── auth.tsx             # Authentication context
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   │
│   ├── constants/               # Application constants
│   │   ├── colors.ts
│   │   ├── theme.ts
│   │   └── nativewind-styles.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   ├── lib/                     # Library abstractions
│   └── assets/                  # Images and static assets
│       └── images/
│
├── config/                       # Configuration files
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── scripts/                      # Build and utility scripts
├── android/                      # Android native code
├── ios/                         # iOS native code
├── app.json                     # Expo app configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🎯 Key Improvements

1. **Centralized `src/` Directory**: All source code is now organized under a single `src/` folder for better project organization.

2. **Feature-Based Structure**: Features are organized in `src/features/` following feature-driven development pattern:
   - Each feature (auth, home, cards, etc.) is self-contained
   - Easy to scale and maintain
   - Clear separation of concerns

3. **Config Files Organized**: Configuration files moved to `config/` directory:
   - Root-level config files reference the actual configs in `config/`
   - Keeps root directory clean
   - Easier to find and manage configurations

4. **Centralized Types**: All TypeScript types are defined in `src/types/index.ts`:
   - Single source of truth for types
   - Eliminates type duplication
   - Better type management

5. **Updated Import Paths**: All imports now use the `@/src/*` path alias for consistency:
   - Clear distinction between internal and external imports
   - Easier refactoring
   - Better IDE support

## 📝 Import Path Changes

### Old Structure
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { Colors } from '@/constants/theme';
```

### New Structure
```typescript
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/contexts/auth';
import { Colors } from '@/src/constants/theme';
import { User } from '@/src/types';
```

## 🚀 Development Commands

```bash
# Start the development server
npm start

# Start on specific platform
npm run android
npm run ios
npm run web

# Lint the code
npm run lint

# Reset the project
npm run reset-project
```

## 📦 Adding New Features

When adding a new feature:

1. Create a new directory in `src/features/{featureName}/`
2. Add the feature component and exports
3. Create route files in `src/app/` that reference the feature
4. Update imports to use `@/src/*` paths

Example for a new "Settings" feature:
```
src/features/settings/
├── settings.tsx
└── index.ts
```

Then create `src/app/settings.tsx`:
```typescript
export { default } from '@/src/features/settings/settings';
```

## 🔧 Configuration

- **TypeScript**: `tsconfig.json` - Configured with path alias `@/*` pointing to root
- **Tailwind CSS**: `config/tailwind.config.js` - NativeWind integration
- **ESLint**: `config/eslint.config.js` - Expo linting configuration
- **Babel**: `config/babel.config.js` - React Native Reanimated support
- **Metro**: `config/metro.config.js` - React Native bundler config

---

**Last Updated**: November 2025
