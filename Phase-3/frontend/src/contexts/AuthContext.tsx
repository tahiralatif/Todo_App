'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, simpleApiClient } from '@/services/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  profile_photo_url?: string;
  created_at: string;
}

interface AuthTokens {
  token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshTokenValue = localStorage.getItem('refresh_token');

        if (accessToken && refreshTokenValue) {
          setTokens({ token: accessToken, refresh_token: refreshTokenValue });

          // Try to get user profile
          try {
            const userData = await apiClient.getUserProfile();
            setUser(userData);
          } catch (error) {
            // Token might be expired, try refresh
            try {
              await refreshToken();
            } catch (refreshError) {
              // Refresh failed, clear tokens
              clearTokens();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setTokens(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      let response;
      try {
        response = await apiClient.signin(email, password);
      } catch (apiError) {
        // Fallback to simple client if axios is not available
        response = await simpleApiClient.signin(email, password);
      }

      const authTokens: AuthTokens = {
        token: response.token,
        refresh_token: response.refresh_token,
      };

      // Store tokens in localStorage
      localStorage.setItem('access_token', authTokens.token);
      localStorage.setItem('refresh_token', authTokens.refresh_token);

      setTokens(authTokens);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      let response;
      try {
        response = await apiClient.signup(name, email, password);
      } catch (apiError) {
        // Fallback to simple client if axios is not available
        response = await simpleApiClient.signup(name, email, password);
      }

      const authTokens: AuthTokens = {
        token: response.token,
        refresh_token: response.refresh_token,
      };

      // Store tokens in localStorage
      localStorage.setItem('access_token', authTokens.token);
      localStorage.setItem('refresh_token', authTokens.refresh_token);

      setTokens(authTokens);
      setUser(response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.refreshToken(refreshTokenValue) as { token: string; refresh_token: string };

      const newTokens: AuthTokens = {
        token: response.token,
        refresh_token: response.refresh_token,
      };

      // Update tokens in localStorage
      localStorage.setItem('access_token', newTokens.token);
      localStorage.setItem('refresh_token', newTokens.refresh_token);

      setTokens(newTokens);
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const updatedUser = await apiClient.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    login,
    signup,
    logout,
    refreshToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};