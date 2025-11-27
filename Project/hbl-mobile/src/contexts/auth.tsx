import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { authService } from '@/src/services';
import { ApiUser, RegisterRequest, ApiError } from '@/src/types/api';
import { api, onUnauthorized } from '@/src/lib/apiClient';
import { STORAGE_KEYS } from '@/src/config';

// User type used in the app (mapped from ApiUser)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for display
  email: string;
  phone: string;
  profileImage?: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

// Signup data type for registration form
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps API user response to app User type
 */
function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser._id,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    phone: apiUser.phone,
    profileImage: apiUser.profilePicture,
    role: apiUser.role,
    isEmailVerified: apiUser.isEmailVerified,
    isPhoneVerified: apiUser.isPhoneVerified,
  };
}

/**
 * Maps signup form data to API request format
 */
function mapSignupDataToRequest(data: SignupData): RegisterRequest {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phone: data.phone,
    cnic: data.cnic,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    address: {
      street: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode || '00000',
      country: 'Pakistan',
    },
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Flag to prevent 401 handler during initialization
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Save user data to AsyncStorage for persistence
   */
  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to save user to storage:', err);
    }
  };

  /**
   * Load user data from AsyncStorage
   */
  const loadUserFromStorage = async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error('Failed to load user from storage:', err);
      return null;
    }
  };

  /**
   * Clear user data from AsyncStorage
   */
  const clearUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (err) {
      console.error('Failed to clear user from storage:', err);
    }
  };

  /**
   * Handle unauthorized (401) errors - clear state and redirect to login
   * Only handle if not during initialization (to avoid double handling)
   */
  const handleUnauthorized = useCallback(async () => {
    // Skip if still initializing - initialization handles its own errors
    if (isInitializing) {
      console.log('Skipping 401 handler during initialization');
      return;
    }
    console.log('Unauthorized - clearing auth state and redirecting to login');
    setUser(null);
    await clearUserFromStorage();
    // Navigate to login screen
    router.replace('/(auth)/login');
  }, [router, isInitializing]);

  /**
   * Initialize auth state on app load
   * First load cached user for immediate display, then validate with server
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const hasToken = await api.hasToken();

        if (hasToken) {
          // First, try to load cached user for faster startup
          const cachedUser = await loadUserFromStorage();
          if (cachedUser && isMounted) {
            setUser(cachedUser);
          }

          // Then validate token and refresh user data from server
          try {
            const apiUser = await authService.getCurrentUser();
            if (isMounted) {
              console.log('Token valid, user authenticated');
              const freshUser = mapApiUserToUser(apiUser);
              setUser(freshUser);
              await saveUserToStorage(freshUser);
            }
          } catch {
            // Token invalid or expired, clear everything
            if (isMounted) {
              console.log('Token validation failed, clearing auth state');
              setUser(null);
              await api.removeToken();
              await clearUserFromStorage();
            }
          }
        } else {
          console.log('No token found, user not authenticated');
        }
      } catch {
        // Initialization error, clear everything
        if (isMounted) {
          console.log('Auth initialization failed, clearing token');
          await api.removeToken();
          await clearUserFromStorage();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Subscribe to 401 unauthorized events from API client
   */
  useEffect(() => {
    const unsubscribe = onUnauthorized(handleUnauthorized);
    return unsubscribe;
  }, [handleUnauthorized]);

  /**
   * Protect routes - redirect based on auth state
   */
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not on auth screen - redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is signed in but on auth screen - redirect to home
      router.replace('/(tabs)');
    }
  }, [user, segments, isInitialized, router]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const userData = mapApiUserToUser(response.user);
      setUser(userData);
      // Persist user data for next app launch
      await saveUserToStorage(userData);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const signup = useCallback(async (userData: SignupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const request = mapSignupDataToRequest(userData);
      const response = await authService.register(request);
      const user = mapApiUserToUser(response.user);
      setUser(user);
      // Persist user data for next app launch
      await saveUserToStorage(user);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      // Clear persisted user data
      await clearUserFromStorage();
      setIsLoading(false);
      // Navigate to login
      router.replace('/(auth)/login');
    }
  }, [router]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const apiUser = await authService.getCurrentUser();
      setUser(mapApiUserToUser(apiUser));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        error,
        login,
        signup,
        logout,
        clearError,
        refreshUser,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
