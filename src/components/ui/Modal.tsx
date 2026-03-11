import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export function ModalContent({
  className,
  children,
  ...props
}: Dialog.DialogContentProps & { className?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-2xl border border-border bg-cardToken text-cardToken-foreground shadow-2xl',
          'p-6 focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          className={cn(
            'absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl',
            'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          )}
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

export const ModalTitle = Dialog.Title;
export const ModalDescription = Dialog.Description;

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export function ModalContent({
  className,
  children,
  ...props
}: Dialog.DialogContentProps & { className?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-2xl border border-border bg-cardToken text-cardToken-foreground shadow-2xl',
          'p-6 focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          className={cn(
            'absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl',
            'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          )}
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

export const ModalTitle = Dialog.Title;
export const ModalDescription = Dialog.Description;

