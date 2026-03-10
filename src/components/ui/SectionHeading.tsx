import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './Badge';
interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}
export function SectionHeading({
  badge,
  title,
  description,
  centered = false,
  light = false,
  className = ''
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true,
        margin: '-100px'
      }}
      transition={{
        duration: 0.5
      }}
      className={`flex flex-col gap-4 ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>

      {badge && <Badge variant={light ? 'dark' : 'primary'}>{badge}</Badge>}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold ${light ? 'text-white' : 'text-slate-900'}`}>

        {title}
      </h2>
      {description &&
      <p
        className={`text-lg max-w-2xl ${light ? 'text-slate-300' : 'text-slate-600'}`}>

          {description}
        </p>
      }
    </motion.div>);

}