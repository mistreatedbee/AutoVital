import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  XIcon,
  SearchIcon,
  ActivityIcon } from
'lucide-react';
import { Input } from '../ui/Input';
interface DashboardLayoutProps {
  children: React.ReactNode;
}
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  const navLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon className="w-5 h-5" />
  },
  {
    name: 'My Vehicles',
    path: '/dashboard/vehicles',
    icon: <CarIcon className="w-5 h-5" />
  },
  {
    name: 'Maintenance Log',
    path: '/dashboard/maintenance',
    icon: <WrenchIcon className="w-5 h-5" />
  },
  {
    name: 'Fuel Tracker',
    path: '/dashboard/fuel',
    icon: <FuelIcon className="w-5 h-5" />
  },
  {
    name: 'Alerts & Reminders',
    path: '/dashboard/alerts',
    icon: <BellIcon className="w-5 h-5" />
  },
  {
    name: 'Documents',
    path: '/dashboard/documents',
    icon: <FileTextIcon className="w-5 h-5" />
  },
  {
    name: 'Reports',
    path: '/dashboard/reports',
    icon: <BarChart3Icon className="w-5 h-5" />
  },
  {
    name: 'Billing',
    path: '/dashboard/billing',
    icon: <CreditCardIcon className="w-5 h-5" />
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];

  const handleLogout = () => {
    navigate('/login');
  };
  const SidebarContent = () =>
  <div className="flex flex-col h-full bg-dark text-slate-300">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link
        to="/dashboard"
        className="flex items-center gap-3 font-heading font-bold text-xl text-white">

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md">
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary-500/10 text-primary-400 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}>

              <span
              className={isActive ? 'text-primary-500' : 'text-slate-500'}>

                {link.icon}
              </span>
              {link.name}
            </Link>);

      })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <img
          src="https://i.pravatar.cc/150?img=11"
          alt="User"
          className="w-10 h-10 rounded-full border-2 border-slate-700" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Alex Thompson
            </p>
            <p className="text-xs text-slate-500 truncate">Pro Plan</p>
          </div>
        </div>
        <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors">

          <LogOutIcon className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>;

  return (
    <div className="min-h-screen flex bg-slate-50 font-body">
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" />

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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100">

              <MenuIcon className="w-6 h-6" />
            </button>
            <div className="hidden md:block w-full max-w-md">
              <Input
                placeholder="Search vehicles, logs, documents..."
                icon={<SearchIcon className="w-4 h-4" />}
                className="bg-slate-50 border-transparent focus:bg-white" />

            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <Link to="/dashboard/settings" className="hidden sm:block">
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="User"
                className="w-9 h-9 rounded-full border border-slate-200" />

            </Link>
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