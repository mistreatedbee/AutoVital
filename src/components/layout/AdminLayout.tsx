import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthProvider';
import {
  ActivityIcon,
  UsersIcon,
  CarIcon,
  WrenchIcon,
  BellIcon,
  CreditCardIcon,
  FileTextIcon,
  BarChart3Icon,
  LifeBuoyIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  ShieldAlertIcon,
  DropletIcon,
  FolderIcon,
  ScrollTextIcon,
  UserCogIcon,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
interface AdminLayoutProps {
  children: React.ReactNode;
}
export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  const navLinks = [
  {
    name: 'Overview',
    path: '/admin',
    icon: <ActivityIcon className="w-5 h-5" />
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: <UsersIcon className="w-5 h-5" />
  },
  {
    name: 'Vehicles',
    path: '/admin/vehicles',
    icon: <CarIcon className="w-5 h-5" />
  },
  {
    name: 'Maintenance',
    path: '/admin/maintenance',
    icon: <WrenchIcon className="w-5 h-5" />
  },
  {
    name: 'Fuel & Usage',
    path: '/admin/fuel',
    icon: <DropletIcon className="w-5 h-5" />
  },
  {
    name: 'Documents',
    path: '/admin/documents',
    icon: <FolderIcon className="w-5 h-5" />
  },
  {
    name: 'Alerts & Comms',
    path: '/admin/alerts',
    icon: <BellIcon className="w-5 h-5" />
  },
  {
    name: 'Pricing & Plans',
    path: '/admin/pricing',
    icon: <CreditCardIcon className="w-5 h-5" />
  },
  {
    name: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: <CreditCardIcon className="w-5 h-5" />
  },
  {
    name: 'Content',
    path: '/admin/content',
    icon: <FileTextIcon className="w-5 h-5" />
  },
  {
    name: 'Roles',
    path: '/admin/roles',
    icon: <UserCogIcon className="w-5 h-5" />
  },
  {
    name: 'Audit Logs',
    path: '/admin/audit-logs',
    icon: <ScrollTextIcon className="w-5 h-5" />
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: <BarChart3Icon className="w-5 h-5" />
  },
  {
    name: 'Support',
    path: '/admin/support',
    icon: <LifeBuoyIcon className="w-5 h-5" />
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login');
    }
  };
  const SidebarContent = () =>
  <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
        <Link
        to="/admin"
        className="flex items-center gap-3 font-heading font-bold text-xl text-white">

          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md">
            <ShieldAlertIcon className="w-5 h-5" />
          </div>
          AutoVital
        </Link>
        <Badge
        variant="dark"
        className="bg-primaryToken/10 text-primaryToken-foreground border-primaryToken/20 text-[10px] uppercase tracking-wider">

          Admin
        </Badge>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {navLinks.map((link) => {
        const isActive =
        location.pathname === link.path ||
        link.path !== '/admin' && location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive
                ? 'bg-primary-500 text-white font-medium'
                : 'hover:bg-slate-800 hover:text-white'
            }`}>

              <span className={isActive ? 'text-white' : 'text-slate-500'}>
                {link.icon}
              </span>
              {link.name}
            </Link>);

      })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sidebar-muted border-2 border-sidebar-border">
            <ShieldAlertIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Super Admin
            </p>
            <p className="text-xs text-sidebar-muted truncate">System Access</p>
          </div>
        </div>
        <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-muted hover:bg-white/5 hover:text-destructive transition-colors">

          <LogOutIcon className="w-5 h-5" />
          Secure Logout
        </button>
      </div>
    </div>;

  return (
    <div className="min-h-screen flex bg-surfaceToken font-body text-foreground">
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
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground lg:hidden rounded-lg hover:bg-muted">

              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="hidden md:block w-full max-w-md">
              <Input
                placeholder="Search users, vehicles, tickets..."
                icon={<SearchIcon className="w-4 h-4" />}
                className="bg-muted/60 border-transparent focus:bg-background" />

            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="warning"
              className="hidden sm:inline-flex shadow-sm">

              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
              Admin Mode
            </Badge>
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
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