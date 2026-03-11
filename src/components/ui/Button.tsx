import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../lib/cn';

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'
  // legacy variants (backwards compatible)
  | 'primary'
  | 'accent'
  | 'white';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}
export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  icon,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-60 disabled:pointer-events-none'
  );

  const variants: Record<ButtonVariant, string> = {
    default:
      'bg-primaryToken text-primaryToken-foreground shadow-sm hover:opacity-95',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-muted',
    outline:
      'border border-border bg-transparent text-foreground shadow-sm hover:bg-muted',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
    destructive:
      'bg-destructive text-destructive-foreground shadow-sm hover:opacity-95',
    link: 'bg-transparent text-primaryToken underline-offset-4 hover:underline',
    // legacy
    primary:
      'bg-primaryToken text-primaryToken-foreground shadow-sm hover:opacity-95',
    accent:
      'bg-accentToken text-accentToken-foreground shadow-sm hover:opacity-95',
    white: 'bg-cardToken text-primaryToken shadow-sm hover:bg-muted',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-0',
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
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}>

      {loading && <Loader2Icon className="w-5 h-5 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>);

}