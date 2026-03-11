import React from 'react';
import { cn } from '../../lib/cn';

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl bg-muted',
        className
      )}
    />
  );
}

