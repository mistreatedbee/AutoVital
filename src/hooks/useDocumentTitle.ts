import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'AutoVital - Vehicle Management Made Simple',
  '/features': 'Features - AutoVital',
  '/how-it-works': 'How It Works - AutoVital',
  '/pricing': 'Pricing - AutoVital',
  '/about': 'About - AutoVital',
  '/contact': 'Contact - AutoVital',
  '/blog': 'Blog - AutoVital',
  '/terms': 'Terms of Service - AutoVital',
  '/privacy': 'Privacy Policy - AutoVital',
  '/faq': 'FAQ - AutoVital',
  '/cookies': 'Cookies - AutoVital',
  '/security': 'Security - AutoVital',
  '/careers': 'Careers - AutoVital',
  '/changelog': 'Changelog - AutoVital',
  '/login': 'Log in - AutoVital',
  '/signup': 'Sign up - AutoVital',
  '/forgot-password': 'Reset Password - AutoVital',
  '/reset-password': 'Set New Password - AutoVital',
  '/verify-email': 'Verify Email - AutoVital',
  '/welcome': 'Welcome - AutoVital',
  '/onboarding': 'Get Started - AutoVital',
  '/dashboard': 'Dashboard - AutoVital',
  '/dashboard/vehicles': 'My Vehicles - AutoVital',
  '/dashboard/maintenance': 'Maintenance Log - AutoVital',
  '/dashboard/fuel': 'Fuel Tracker - AutoVital',
  '/dashboard/mileage': 'Mileage - AutoVital',
  '/dashboard/alerts': 'Alerts & Reminders - AutoVital',
  '/dashboard/documents': 'Documents - AutoVital',
  '/dashboard/reports': 'Reports - AutoVital',
  '/dashboard/billing': 'Billing - AutoVital',
  '/dashboard/settings': 'Settings - AutoVital',
  '/admin': 'Admin - AutoVital',
};

function getTitleForPath(pathname: string): string {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }
  if (pathname.startsWith('/dashboard/vehicles/')) {
    return pathname.endsWith('/edit') ? 'Edit Vehicle - AutoVital' : 'Vehicle Details - AutoVital';
  }
  if (pathname.startsWith('/blog/')) {
    return 'Article - AutoVital';
  }
  if (pathname.startsWith('/admin/')) {
    return 'Admin - AutoVital';
  }
  return 'AutoVital - Vehicle Management';
}

export function useDocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getTitleForPath(pathname);
  }, [pathname]);
}
