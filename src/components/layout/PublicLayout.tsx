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
      <PublicNavbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>);

}