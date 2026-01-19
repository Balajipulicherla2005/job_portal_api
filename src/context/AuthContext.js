import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
          setAuthError(null);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only remove token if it's an actual auth error, not a network error
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      // Don't clear user on network errors - they might still be logged in
      setAuthError(error.response?.data?.message || 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      // Split name into firstName and lastName
      const nameParts = (userData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'User';

      // Map frontend role names to backend role names
      // Frontend uses: 'jobseeker', 'employer'
      // Backend expects: 'job_seeker', 'employer'
      let role = userData.userType;
      if (role === 'jobseeker') {
        role = 'job_seeker';
      }

      // Map frontend fields to backend fields
      const backendData = {
        email: userData.email,
        password: userData.password,
        role: role,
        firstName: firstName,
        lastName: lastName,
        phone: userData.phone || ''
      };

      if (userData.userType === 'employer') {
        backendData.companyName = userData.companyName;
        backendData.companyDescription = userData.companyDescription;
      }

      console.log('Sending registration data:', backendData);

      const response = await api.post('/auth/register', backendData);
      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        localStorage.setItem('token', token);
        setUser(newUser);
        return { success: true, user: newUser };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed';
      setAuthError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthError(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  // Helper function to check role
  const checkIsJobSeeker = (userObj) => {
    if (!userObj) return false;
    const role = userObj.role?.toLowerCase();
    // Handle both formats for backwards compatibility
    return role === 'jobseeker' || role === 'job_seeker';
  };

  const checkIsEmployer = (userObj) => {
    if (!userObj) return false;
    return userObj.role?.toLowerCase() === 'employer';
  };

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isJobSeeker: checkIsJobSeeker(user),
    isEmployer: checkIsEmployer(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
