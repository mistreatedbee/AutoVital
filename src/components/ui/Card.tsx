import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/cn';
interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glass?: boolean;
  dark?: boolean;
}
export function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  dark = false,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl overflow-hidden';
  let styles = baseStyles;
  if (glass) {
    styles += dark ? ' glass-panel-dark' : ' glass-panel';
  } else {
    styles += dark ?
      ' bg-sidebar border border-sidebar-border text-white' :
      ' bg-cardToken text-cardToken-foreground border border-border shadow-card';
  }
  if (hover) {
    styles +=
    ' transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1';
  }
  return (
    <motion.div className={cn(styles, className)} {...props}>
      {children}
    </motion.div>);

}