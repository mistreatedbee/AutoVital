import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary:
    'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:from-primary-500 hover:to-primary-400 focus:ring-primary-500',
    secondary:
    'bg-white text-slate-700 border border-slate-200 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500 shadow-sm',
    ghost:
    'bg-transparent text-slate-600 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    accent:
    'bg-gradient-to-r from-accent-500 to-accent-400 text-dark shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:from-accent-400 hover:to-accent-300 focus:ring-accent-500',
    white:
    'bg-white text-primary-600 shadow-lg hover:bg-slate-50 focus:ring-white focus:ring-offset-dark'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  return (
    <motion.button
      whileHover={
      disabled || loading ?
      {} :
      {
        scale: 1.02
      }
      }
      whileTap={
      disabled || loading ?
      {} :
      {
        scale: 0.98
      }
      }
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}>

      {loading && <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>);

}