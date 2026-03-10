import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
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
    ' bg-slate-800 border border-slate-700' :
    ' bg-white border border-slate-100 shadow-card';
  }
  if (hover) {
    styles +=
    ' transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1';
  }
  return (
    <motion.div className={`${styles} ${className}`} {...props}>
      {children}
    </motion.div>);

}