import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { useAccount } from '../../account/AccountProvider';
import { fetchUserAlerts } from '../../services/alerts';
import { fetchCurrentProfile } from '../../services/profile';
import { queryKeys } from '../../lib/queryKeys';
import {
  HomeIcon,
  CarIcon,
  WrenchIcon,
  FuelIcon,
  BellIcon,
  FileTextIcon,
  BarChart3Icon,
  CreditCardIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  ActivityIcon } from
'lucide-react';
import { Input } from '../ui/Input';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { accountId } = useAccount();
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile.current(user?.id ?? ''),
    queryFn: () => fetchCurrentProfile(user!.id),
    enabled: !!user?.id,
  });
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    const loadAlerts = async () => {
      if (!accountId) {
        if (active) setUnreadAlertCount(0);
        return;
      }
      const alerts = await fetchUserAlerts(accountId);
      if (!active) return;
      setUnreadAlertCount(alerts.filter((a) => a.status === 'open').length);
    };

    void loadAlerts();
    const interval = setInterval(() => void loadAlerts(), 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [accountId]);
  const navLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: 'My Vehicles',
      path: '/dashboard/vehicles',
      icon: <CarIcon className="w-5 h-5" />,
    },
    {
      name: 'Maintenance Log',
      path: '/dashboard/maintenance',
      icon: <WrenchIcon className="w-5 h-5" />,
    },
    {
      name: 'Fuel Tracker',
      path: '/dashboard/fuel',
      icon: <FuelIcon className="w-5 h-5" />,
    },
    {
      name: 'Mileage',
      path: '/dashboard/mileage',
      icon: <ActivityIcon className="w-5 h-5" />,
    },
    {
      name: 'Alerts & Reminders',
      path: '/dashboard/alerts',
      icon: <BellIcon className="w-5 h-5" />,
    },
    {
      name: 'Documents',
      path: '/dashboard/documents',
      icon: <FileTextIcon className="w-5 h-5" />,
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: <BarChart3Icon className="w-5 h-5" />,
    },
    {
      name: 'Billing',
      path: '/dashboard/billing',
      icon: <CreditCardIcon className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login');
    }
  };

  const handleNotificationsClick = () => {
    navigate('/dashboard/alerts');
  };
  const SidebarContent = () =>
  {
    const avatarSrc = profile?.avatarUrl || 'https://i.pravatar.cc/150?img=11';
    const displayName = profile?.displayName?.trim() || user?.name || user?.email || 'Account';

    return (
  <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
        <Link
        to="/dashboard"
        className="flex items-center gap-3 font-heading font-bold text-xl text-white">

          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md">
            <ActivityIcon className="w-5 h-5" />
          </div>
          AutoVital
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navLinks.map((link) => {
        const isActive =
        location.pathname === link.path ||
        link.path !== '/dashboard' &&
        location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive
                ? 'bg-primary-500 text-white font-medium'
                : 'hover:bg-slate-800 hover:text-white'
            }`}>

              <span
              className={isActive ? 'text-white' : 'text-slate-500'}>

                {link.icon}
              </span>
              {link.name}
            </Link>);

      })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <img
          src={avatarSrc}
          alt={displayName}
          className="w-10 h-10 rounded-full border-2 border-sidebar-border" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-sidebar-muted truncate">
              {accountId ? 'AutoVital' : 'Loading…'}
            </p>
          </div>
        </div>
        <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-muted hover:bg-white/5 hover:text-primaryToken transition-colors"
        aria-label="Log out">

          <LogOutIcon className="w-5 h-5" aria-hidden />
          Log Out
        </button>
      </div>
    </div>);
  };

  return (
    <div className="min-h-screen flex bg-surfaceToken font-body text-foreground">
      <a
        href="#main-content"
        className="fixed -top-12 left-4 z-[60] px-4 py-2 bg-primary-500 text-white rounded-lg font-medium transition-all duration-150 focus:top-4 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-sidebar/60 backdrop-blur-sm z-40 lg:hidden" />

            <motion.aside
            initial={{
              x: '-100%'
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: '-100%'
            }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.3
            }}
            className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl">

              <SidebarContent />
            </motion.aside>
          </>
        }
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-cardToken border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground lg:hidden rounded-lg hover:bg-muted"
              aria-label="Open navigation menu">

              <MenuIcon className="w-6 h-6" aria-hidden />
            </button>
            <div className="hidden md:block w-full max-w-md">
              <Input
                placeholder="Search vehicles, logs, documents..."
                icon={<SearchIcon className="w-4 h-4" />}
                className="bg-muted/60 border-transparent focus:bg-background" />

            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleNotificationsClick}
              className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="View notifications">
              <BellIcon className="w-6 h-6" aria-hidden />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] leading-[18px] text-center rounded-full border border-white">
                  {unreadAlertCount > 99 ? '99+' : unreadAlertCount}
                </span>
              )}
            </button>
            <Link to="/dashboard/settings" className="hidden sm:block">
              <img
                src={profile?.avatarUrl || 'https://i.pravatar.cc/150?img=11'}
                alt={profile?.displayName?.trim() || user?.name ?? user?.email ?? 'Profile'}
                className="w-9 h-9 rounded-full border border-border" />

            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 p-4 sm:p-8 overflow-x-hidden" tabIndex={-1}>
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.4
            }}
            className="max-w-7xl mx-auto">

            {children}
          </motion.div>
        </main>
      </div>
    </div>);

}
