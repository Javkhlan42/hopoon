'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    phone: string;
    password: string;
    name: string;
    email?: string;
    role?: 'driver' | 'passenger';
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response = await apiClient.auth.login(phone, password);
      const data = response.data || response;
      const authData = 'data' in data ? data.data : data;

      if (authData?.accessToken) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        setUser(authData.user);
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Нэвтрэхэд алдаа гарлаа');
    }
  };

  const register = async (data: {
    phone: string;
    password: string;
    name: string;
    email?: string;
    role?: 'driver' | 'passenger';
  }) => {
    try {
      const response = await apiClient.auth.register(data);
      const responseData = response.data || response;

      if (responseData?.accessToken) {
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('refreshToken', responseData.refreshToken);
        setUser(responseData.user);
        router.push('/');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Бүртгэлд алдаа гарлаа');
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.auth.getCurrentUser();
      const userData = response.data || response;

      if (userData) {
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
