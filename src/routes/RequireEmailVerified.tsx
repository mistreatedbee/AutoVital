import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { AuthRouteLoading } from '../components/states/LoadingState';

/**
 * Layout route that requires a verified email address.
 * Redirects unverified users to /verify-email.
 * Must be used inside ProtectedRoute (user is guaranteed).
 */
export function RequireEmailVerified() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthRouteLoading label="Loading…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
