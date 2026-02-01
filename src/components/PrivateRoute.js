import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, userType }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role matches the required userType
  if (userType && user.role !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
