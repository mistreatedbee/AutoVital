import React from 'react';
import { motion } from 'framer-motion';
interface ToggleProps {
  options: [string, string];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
export function Toggle({
  options,
  value,
  onChange,
  className = ''
}: ToggleProps) {
  const isRight = value === options[1];
  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>

      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors z-10 ${isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>

            {isSelected &&
            <motion.div
              layoutId="toggle-bg"
              className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }} />

            }
            <span className="relative z-20">{option}</span>
          </button>);

      })}
    </div>);

}