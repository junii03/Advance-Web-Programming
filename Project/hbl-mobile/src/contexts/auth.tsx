import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authService } from '@/src/services';
import { ApiUser, RegisterRequest, ApiError } from '@/src/types/api';
import { api } from '@/src/lib/apiClient';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state on app load
   * Check if user has a valid token and fetch their profile
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasToken = await api.hasToken();
        if (hasToken) {
          const apiUser = await authService.getCurrentUser();
          setUser(mapApiUserToUser(apiUser));
        }
      } catch (err) {
        // Token invalid or expired, clear it
        console.log('Auth initialization failed, clearing token');
        await api.removeToken();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      setUser(mapApiUserToUser(response.user));
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
      setUser(mapApiUserToUser(response.user));
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
      setIsLoading(false);
    }
  }, []);

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
