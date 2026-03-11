import React, { useMemo, useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { AuthRouteLoading } from '../components/states/LoadingState';
import {
  listMfaFactors,
  isAdminMfaVerifiedThisSession,
} from '../services/adminMfa';

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
  const location = useLocation();
  const [mfaChecking, setMfaChecking] = useState(true);
  const [hasMfa, setHasMfa] = useState(false);

  const allowlist = useMemo(
    () => parseAdminAllowlist(import.meta.env.VITE_ADMIN_EMAILS as string | undefined),
    [],
  );

  const email = user?.email?.toLowerCase() ?? '';
  const isAdmin = Boolean(email) && allowlist.has(email);

  const isMfaRoute =
    location.pathname.endsWith('/mfa-setup') || location.pathname.endsWith('/mfa-verify');

  useEffect(() => {
    if (!isAdmin || isMfaRoute) {
      setMfaChecking(false);
      return;
    }
    let isMounted = true;
    listMfaFactors()
      .then((factors) => {
        if (isMounted) setHasMfa(factors.length > 0);
      })
      .catch(() => {
        if (isMounted) setHasMfa(false);
      })
      .finally(() => {
        if (isMounted) setMfaChecking(false);
      });
    return () => { isMounted = false; };
  }, [isAdmin, isMfaRoute]);

  if (loading) {
    return <AuthRouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isMfaRoute) {
    return <Outlet />;
  }

  if (mfaChecking) {
    return <AuthRouteLoading />;
  }

  if (!hasMfa) {
    return <Navigate to="/admin/mfa-setup" replace />;
  }

  if (!isAdminMfaVerifiedThisSession()) {
    return <Navigate to="/admin/mfa-verify" replace />;
  }

  return <Outlet />;
}

