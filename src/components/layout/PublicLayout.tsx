import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
interface PublicLayoutProps {
  children: React.ReactNode;
}
export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <a
        href="#main-content"
        className="fixed -top-12 left-4 z-[60] px-4 py-2 bg-primary-500 text-white rounded-lg font-medium transition-all duration-150 focus:top-4 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <PublicNavbar />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>);

}