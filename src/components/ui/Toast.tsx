import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';

export type ToastInput = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastStyles(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'border-emerald-500/20 bg-cardToken text-foreground';
    case 'warning':
      return 'border-amber-500/20 bg-cardToken text-foreground';
    case 'destructive':
      return 'border-destructive/20 bg-cardToken text-foreground';
    default:
      return 'border-border bg-cardToken text-foreground';
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id =
      globalThis.crypto && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);

    setItems((prev) => [
      ...prev,
      {
        id,
        variant: input.variant ?? 'default',
        durationMs: input.durationMs ?? 4500,
        title: input.title,
        description: input.description,
      },
    ]);
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(
              'group pointer-events-auto relative w-full max-w-sm rounded-2xl border p-4 shadow-2xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full',
              toastStyles(t.variant ?? 'default')
            )}
            duration={t.durationMs}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            <div className="grid gap-1 pr-8">
              {t.title ? (
                <ToastPrimitive.Title className="text-sm font-semibold">
                  {t.title}
                </ToastPrimitive.Title>
              ) : null}
              {t.description ? (
                <ToastPrimitive.Description className="text-sm text-muted-foreground">
                  {t.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              className={cn(
                'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl',
                'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
              )}
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
