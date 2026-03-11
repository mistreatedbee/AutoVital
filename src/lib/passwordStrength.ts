export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-amber-500';
    case 'good':
      return 'bg-lime-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-slate-300';
  }
}

export function getStrengthWidth(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'w-1/4';
    case 'fair':
      return 'w-1/2';
    case 'good':
      return 'w-3/4';
    case 'strong':
      return 'w-full';
    default:
      return 'w-0';
  }
}
