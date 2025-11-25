# HBL Mobile - Expo Router Routing Guide

## 📱 Routing Structure

This application uses Expo Router following industry-standard conventions with grouped routes for better organization and scalability.

### Root Route Structure

```
src/app/
├── _layout.tsx              # Root layout with auth context
├── (auth)/                  # Authentication group (when NOT authenticated)
├── (tabs)/                  # Tab navigation (when authenticated)
├── (account)/               # Account-related screens
├── (transactions)/          # Transaction-related screens
└── (modals)/                # Modal presentations
```

## 📍 Route Groups Explained

### 1. **Auth Group `(auth)`**

Shown when user is **NOT authenticated**.

**Files:**
- `(auth)/_layout.tsx` - Auth group layout
- `(auth)/login.tsx` - Login screen
- `(auth)/signup.tsx` - Sign up screen

**Navigation:**
```typescript
// From signup to login
router.push('/(auth)/login');

// From login to signup
router.push('/(auth)/signup');
```

**Usage Example:**
```typescript
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View>
      {/* Login form */}
      <Button onPress={handleSignUp} title="Sign Up" />
    </View>
  );
}
```

---

### 2. **Tabs Group `(tabs)`**

Main authenticated navigation with tab-based routing. Shown when user **IS authenticated**.

**Files:**
- `(tabs)/_layout.tsx` - Tab navigation layout
- `(tabs)/index.tsx` - Home tab (default)
- `(tabs)/explore.tsx` - Explore tab

**Navigation:**
```typescript
// Navigate to home tab
router.push('/(tabs)/');

// Navigate to explore tab
router.push('/(tabs)/explore');
```

**Header Configuration:**
Each tab can have its own header styling. Configure in `(tabs)/_layout.tsx`:

```typescript
<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    headerShown: true,
    // ...
  }}
/>
```

---

### 3. **Account Group `(account)`**

Account-related screens like profile and card management. Accessible from any authenticated screen.

**Files:**
- `(account)/_layout.tsx` - Account group layout with back button
- `(account)/profile.tsx` - User profile screen
- `(account)/cards.tsx` - Payment cards screen

**Navigation:**
```typescript
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View>
      <Button
        title="View Profile"
        onPress={() => router.push('/(account)/profile')}
      />
      <Button
        title="My Cards"
        onPress={() => router.push('/(account)/cards')}
      />
    </View>
  );
}
```

**Features:**
- Automatic back button in header
- Gesture-enabled go back
- Consistent header styling

---

### 4. **Transactions Group `(transactions)`**

Transaction-related screens for money transfers and history.

**Files:**
- `(transactions)/_layout.tsx` - Transactions group layout with back button
- `(transactions)/transfer.tsx` - Money transfer screen
- `(transactions)/history.tsx` - Transaction history screen

**Navigation:**
```typescript
const router = useRouter();

// Navigate to transfer
router.push('/(transactions)/transfer');

// Navigate to transaction history
router.push('/(transactions)/history');
```

**Usage Example:**
```typescript
<Button
  title="Send Money"
  onPress={() => {
    router.push('/(transactions)/transfer');
  }}
/>
```

---

### 5. **Modals Group `(modals)`**

Modal presentations shown on top of other screens.

**Files:**
- `(modals)/_layout.tsx` - Modals group layout
- `(modals)/modal.tsx` - Generic modal screen

**Navigation:**
```typescript
router.push('/(modals)/modal');
```

**Features:**
- Presents as modal on top of current stack
- Animated transitions
- Gesture to dismiss enabled

---

## 🔄 Authentication Flow

### Unauthenticated State
```
User opens app
  ↓
RootLayout checks auth
  ↓
Shows (auth) group
  ↓
User sees login/signup
```

### Authenticated State
```
User logs in
  ↓
AuthContext updates
  ↓
RootLayout detects authenticated state
  ↓
Shows (tabs) group
  ↓
User can navigate to (account), (transactions), etc.
```

### Logout Flow
```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  // RootLayout automatically shows (auth) group
  // Router resets to login screen
};
```

---

## 📝 Adding New Routes

### Example: Add a "Settings" Screen

1. **Create folder:**
   ```bash
   mkdir -p src/app/settings
   ```

2. **Create layout file** (`src/app/settings/_layout.tsx`):
   ```typescript
   import { Stack } from 'expo-router';

   export default function SettingsLayout() {
     return (
       <Stack>
         <Stack.Screen name="index" options={{ title: 'Settings' }} />
         <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
       </Stack>
     );
   }
   ```

3. **Create screen files:**
   - `src/app/settings/index.tsx` - Settings screen
   - `src/app/settings/help.tsx` - Help screen

4. **Create feature files** in `src/features/settings/`:
   ```
   src/features/settings/
   ├── settings.tsx
   ├── help.tsx
   └── index.ts
   ```

5. **Update root layout** (`src/app/_layout.tsx`):
   ```typescript
   <Stack.Screen
     name="settings"
     options={{ headerShown: false }}
   />
   ```

6. **Navigate to it:**
   ```typescript
   router.push('/settings');
   router.push('/settings/help');
   ```

---

### Example: Add Screen to Existing Group

Add a "verify" screen to auth group:

1. **Create file:** `src/app/(auth)/verify.tsx`
   ```typescript
   export { default } from '@/src/features/auth/verify';
   ```

2. **Update group layout** (`src/app/(auth)/_layout.tsx`):
   ```typescript
   <Stack.Screen
     name="verify"
     options={{ title: 'Verify Account' }}
   />
   ```

3. **Navigate to it:**
   ```typescript
   router.push('/(auth)/verify');
   ```

---

## 🎨 Navigation Patterns

### Deep Linking

```typescript
// Deep link to specific screens
const deepLink = 'myapp://home';
const deepLink2 = 'myapp://account/profile';
const deepLink3 = 'myapp://transactions/transfer';
```

### Dynamic Routes

```typescript
// Passing parameters
router.push({
  pathname: '/(account)/profile',
  params: { userId: '123' }
});

// Accessing in screen
import { useLocalSearchParams } from 'expo-router';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  // Use userId...
}
```

### Conditional Navigation

```typescript
const handleButtonPress = () => {
  if (isAuthenticated) {
    router.push('/(tabs)/');
  } else {
    router.push('/(auth)/login');
  }
};
```

---

## 🚫 Common Mistakes to Avoid

1. ❌ **Forgetting group parentheses in navigation:**
   ```typescript
   // Wrong
   router.push('/account/profile');

   // Correct
   router.push('/(account)/profile');
   ```

2. ❌ **Not updating root layout when adding new groups:**
   Always register new groups in `src/app/_layout.tsx`

3. ❌ **Mixing relative and absolute imports:**
   ```typescript
   // Consistent approach
   import { LoginScreen } from '@/src/features/auth/login';
   ```

4. ❌ **Not using proper header configuration:**
   Configure headers in group layouts, not individual screens

5. ❌ **Stack.Screen name doesn't match filename:**
   ```typescript
   // File: src/app/(auth)/login.tsx
   // Layout:
   <Stack.Screen name="login" /> // ✓ Correct
   <Stack.Screen name="login-screen" /> // ✗ Wrong
   ```

---

## 📚 Best Practices

1. **Use group layouts** to share header config across related screens
2. **Keep related screens together** in feature folders
3. **Use relative routing** when navigating within groups
4. **Export from features** - route files should be minimal wrappers
5. **Test deep linking** to ensure all routes work correctly
6. **Document navigation patterns** for your team
7. **Use TypeScript** for route params to catch navigation errors early

---

## 🔗 Useful Links

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Expo Router Examples](https://github.com/expo/router-app)

---

## 📞 Need Help?

For questions about routing:
1. Check the Expo Router docs
2. Review similar screens in the project
3. Ask the team lead

**Last Updated:** November 2025
