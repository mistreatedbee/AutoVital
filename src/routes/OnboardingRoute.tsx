import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { AuthRouteLoading } from '../components/states/LoadingState';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps the onboarding flow. Redirects to /dashboard if onboarding is already complete.
 * Must be used inside ProtectedRoute (user is guaranteed).
 */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { progress, loading, isComplete } = useOnboardingProgress();

  if (loading) {
    return <AuthRouteLoading label="Loading…" />;
  }

  if (isComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
