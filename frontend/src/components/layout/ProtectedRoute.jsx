import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    // If role mismatch, send to their correct dashboard
    return <Navigate to={user?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
}
