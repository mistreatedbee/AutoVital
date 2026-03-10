import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuIcon, XIcon, ActivityIcon } from 'lucide-react';
import { Button } from '../ui/Button';
export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  // Determine if current page has a dark hero (Landing Page)
  const isDarkHero = location.pathname === '/';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  const navLinks = [
  {
    name: 'Features',
    path: '/features'
  },
  {
    name: 'How It Works',
    path: '/how-it-works'
  },
  {
    name: 'Pricing',
    path: '/pricing'
  },
  {
    name: 'About',
    path: '/about'
  },
  {
    name: 'Blog',
    path: '/blog'
  }];

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass-panel border-b border-slate-200/50 shadow-sm' : `py-6 ${isDarkHero ? 'bg-transparent' : 'bg-transparent'}`}`;
  const textClasses =
  isScrolled || !isDarkHero ?
  'text-slate-600 hover:text-primary-600' :
  'text-slate-300 hover:text-white';
  const logoClasses =
  isScrolled || !isDarkHero ? 'text-slate-900' : 'text-white';
  return (
    <header className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-heading font-bold text-2xl tracking-tight transition-colors ${logoClasses}`}>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg">
              <ActivityIcon className="w-5 h-5" />
            </div>
            AutoVital
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors ${textClasses}`}>

                {link.name}
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className={
                isScrolled || !isDarkHero ?
                'text-slate-600' :
                'text-slate-300 hover:text-white hover:bg-white/10'
                }>

                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

            {mobileMenuOpen ?
            <XIcon className="w-6 h-6" /> :

            <MenuIcon
              className={`w-6 h-6 ${isScrolled || !isDarkHero ? 'text-slate-900' : 'text-white'}`} />

            }
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          transition={{
            duration: 0.2
          }}
          className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg md:hidden">

            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) =>
            <Link
              key={link.name}
              to={link.path}
              className="block px-3 py-4 text-base font-medium text-slate-900 border-b border-slate-100 hover:bg-slate-50">

                  {link.name}
                </Link>
            )}
              <div className="pt-6 pb-2 flex flex-col gap-3 px-3">
                <Link to="/login" className="w-full">
                  <Button variant="secondary" className="w-full justify-center">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="primary" className="w-full justify-center">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}