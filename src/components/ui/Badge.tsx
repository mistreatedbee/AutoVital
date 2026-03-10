import React from 'react';
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
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    accent: 'bg-accent-50 text-accent-700 border-accent-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-[#ECFDF3] text-[#22C55E] border-[#BBF7D0]',
    critical: 'bg-primary-50 text-primary-700 border-primary-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-slate-800 text-slate-300 border-slate-700'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>

      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>);

}