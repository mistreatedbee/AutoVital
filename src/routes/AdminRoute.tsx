import React, { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

function parseAdminAllowlist(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  const allowlist = useMemo(
    () => parseAdminAllowlist(import.meta.env.VITE_ADMIN_EMAILS as string | undefined),
    [],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  const email = user?.email?.toLowerCase() ?? '';
  const isAdmin = Boolean(email) && allowlist.has(email);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

