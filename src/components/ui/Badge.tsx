import React from 'react';
import { cn } from '../../lib/cn';
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'warning' | 'neutral' | 'dark' | 'success' | 'critical';
  className?: string;
  icon?: React.ReactNode;
}
export function Badge({
  children,
  variant = 'primary',
  className = '',
  icon
}: BadgeProps) {
  const variants = {
    primary: 'bg-primaryToken/10 text-primaryToken border-primaryToken/20',
    accent: 'bg-accentToken/10 text-accentToken border-accentToken/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    neutral: 'bg-muted text-muted-foreground border-border',
    dark: 'bg-sidebar text-sidebar-foreground border-sidebar-border'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}>

      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>);

}