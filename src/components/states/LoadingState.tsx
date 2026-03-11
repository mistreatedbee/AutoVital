import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../lib/cn';

export function LoadingState({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-center gap-3 py-10 text-muted-foreground',
        className
      )}
    >
      <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function AuthRouteLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingState label={label} />
    </div>
  );
}

