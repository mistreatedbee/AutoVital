import React, { forwardRef } from 'react';
import { cn } from '../../lib/cn';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label &&
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700">

            {label}
          </label>
        }
        <div className="relative">
          {icon &&
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          }
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring',
              'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
              icon ? 'pl-10' : null,
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input',
              className
            )}
            {...props} />

        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';