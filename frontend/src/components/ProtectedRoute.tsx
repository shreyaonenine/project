import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, role } = useAuth();
  const location = useLocation();

  // 1. Not logged in -> Redirect to login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in, but does not have the required role -> Redirect to landing page
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    alert(`Access Denied: This area requires ${allowedRoles.join(' or ')} privileges.`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};