import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-cardToken text-cardToken-foreground p-6',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-destructive">
          <AlertTriangleIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          {description ? (
            <div className="mt-1 text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {onRetry ? (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

