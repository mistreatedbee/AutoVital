import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LockIcon } from 'lucide-react';

interface ReauthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the verified password on success. Use for change-password/change-email API calls. */
  onSuccess: (verifiedPassword: string) => void;
  title: string;
  description: string;
  verify: (password: string) => Promise<void>;
}

/**
 * Modal that requires the user to enter their current password before
 * performing high-risk actions (email change, password change).
 */
export function ReauthModal({
  open,
  onOpenChange,
  onSuccess,
  title,
  description,
  verify,
}: ReauthModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      await verify(password.trim());
      const verifiedPassword = password.trim();
      setPassword('');
      onSuccess(verifiedPassword);
      onOpenChange(false);
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPassword('');
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockIcon className="w-5 h-5" />}
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Confirm
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
