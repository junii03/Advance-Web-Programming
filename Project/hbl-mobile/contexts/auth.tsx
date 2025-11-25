import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  customerId: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser: User = {
        id: '1',
        name: 'Muhammad Junaid',
        email: email,
        customerId: 'CUST123456',
        profileImage: 'https://via.placeholder.com/150',
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: Math.random().toString(),
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        customerId: `CUST${Date.now()}`,
        profileImage: 'https://via.placeholder.com/150',
      };

      setUser(mockUser);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
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
