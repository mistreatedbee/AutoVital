import React, { useMemo, useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { AuthRouteLoading } from '../components/states/LoadingState';
import {
  listMfaFactors,
  isAdminMfaVerifiedThisSession,
  isMfaSupported,
} from '../services/adminMfa';
import { fetchCurrentUserPlatformAdminStatus } from '../services/platformAdmins';

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
  const [platformStatus, setPlatformStatus] = useState<{
    isSystemAdmin: boolean;
    isCompanyAdmin: boolean;
    companyAccountIds: string[];
  } | null>(null);
  const [mfaChecking, setMfaChecking] = useState(true);
  const [hasMfa, setHasMfa] = useState(false);

  const allowlist = useMemo(
    () => parseAdminAllowlist(import.meta.env.VITE_ADMIN_EMAILS as string | undefined),
    [],
  );

  const email = user?.email?.toLowerCase() ?? '';
  const isSystemAdminFromEnv = Boolean(email) && allowlist.has(email);
  const isAdmin =
    isSystemAdminFromEnv ||
    (platformStatus !== null &&
      (platformStatus.isSystemAdmin || platformStatus.isCompanyAdmin));

  const platformCheckComplete = isSystemAdminFromEnv || platformStatus !== null;

  const isMfaRoute =
    location.pathname.endsWith('/mfa-setup') || location.pathname.endsWith('/mfa-verify');

  const mfaSupported = isMfaSupported();

  useEffect(() => {
    if (!user?.id || isSystemAdminFromEnv) {
      setPlatformStatus({ isSystemAdmin: false, isCompanyAdmin: false, companyAccountIds: [] });
      return;
    }
    let isMounted = true;
    fetchCurrentUserPlatformAdminStatus(user.id)
      .then((status) => {
        if (isMounted) setPlatformStatus(status);
      })
      .catch(() => {
        if (isMounted)
          setPlatformStatus({ isSystemAdmin: false, isCompanyAdmin: false, companyAccountIds: [] });
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id, isSystemAdminFromEnv]);

  useEffect(() => {
    if (!isAdmin || isMfaRoute || !mfaSupported) {
      setMfaChecking(false);
      if (!mfaSupported) setHasMfa(true);
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
    return () => {
      isMounted = false;
    };
  }, [isAdmin, isMfaRoute, mfaSupported]);

  if (loading) {
    return <AuthRouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!platformCheckComplete) {
    return <AuthRouteLoading />;
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

  if (mfaSupported && !hasMfa) {
    return <Navigate to="/admin/mfa-setup" replace />;
  }

  if (mfaSupported && !isAdminMfaVerifiedThisSession()) {
    return <Navigate to="/admin/mfa-verify" replace />;
  }

  return <Outlet />;
}

