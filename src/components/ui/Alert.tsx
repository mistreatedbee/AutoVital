import React from 'react';
import { cn } from '../../lib/cn';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive';

const variantStyles: Record<AlertVariant, string> = {
  default: 'bg-muted/60 border-border text-foreground',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-foreground',
  warning: 'bg-amber-500/10 border-amber-500/20 text-foreground',
  destructive: 'bg-destructive/10 border-destructive/20 text-foreground',
};

export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  className,
}: {
  variant?: AlertVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-2xl border px-4 py-3',
        'flex items-start gap-3',
        variantStyles[variant],
        className
      )}
    >
      {icon ? <div className="mt-0.5 text-muted-foreground">{icon}</div> : null}
      <div className="min-w-0">
        {title ? (
          <div className="text-sm font-semibold leading-5">{title}</div>
        ) : null}
        {description ? (
          <div className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '../../lib/cn';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive';

const variantStyles: Record<AlertVariant, string> = {
  default: 'bg-muted/60 border-border text-foreground',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-foreground',
  warning: 'bg-amber-500/10 border-amber-500/20 text-foreground',
  destructive: 'bg-destructive/10 border-destructive/20 text-foreground',
};

export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  className,
}: {
  variant?: AlertVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-2xl border px-4 py-3',
        'flex items-start gap-3',
        variantStyles[variant],
        className
      )}
    >
      {icon ? <div className="mt-0.5 text-muted-foreground">{icon}</div> : null}
      <div className="min-w-0">
        {title ? (
          <div className="text-sm font-semibold leading-5">{title}</div>
        ) : null}
        {description ? (
          <div className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

