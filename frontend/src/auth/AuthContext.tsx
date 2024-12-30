import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginResponse } from '../types/auth';
import { refreshToken } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (response: LoginResponse) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for existing tokens on startup
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const refreshTokenValue = localStorage.getItem('refresh_token');
        const savedUser = localStorage.getItem('user');
        
        if (token && refreshTokenValue && savedUser) {
          // Verify token by refreshing
          await refreshAuth();
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Session expired. Please login again.',
        }));
        logout();
      }
    };

    checkAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (state.isAuthenticated) {
      const intervalId = setInterval(refreshAuth, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [state.isAuthenticated]);

  const login = (response: LoginResponse) => {
    const { access_token, refresh_token, user } = response;
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setState({
      isAuthenticated: true,
      user,
      isLoading: false,
      error: null,
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
  };

  const refreshAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token found');
      }

      const response = await refreshToken(refreshTokenValue);
      localStorage.setItem('auth_token', response.access_token);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh authentication',
      }));
      logout();
    }
  };

  const value = {
    ...state,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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