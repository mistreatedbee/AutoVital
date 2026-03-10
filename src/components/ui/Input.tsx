import React, { forwardRef } from 'react';
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
            className={`
              w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 
              transition-colors placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'}
              ${className}
            `}
            {...props} />

        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';