import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { AuthRouteLoading } from '../components/states/LoadingState';

interface RequireOnboardingCompleteProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard routes. Redirects to /onboarding if user has not completed onboarding.
 * Must be used inside ProtectedRoute (user is guaranteed).
 */
export function RequireOnboardingComplete({ children }: RequireOnboardingCompleteProps) {
  const { progress, loading, isComplete } = useOnboardingProgress();

  if (loading) {
    return <AuthRouteLoading label="Loading…" />;
  }

  // No progress row or completed_at is null => redirect to onboarding
  if (!progress || !isComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
