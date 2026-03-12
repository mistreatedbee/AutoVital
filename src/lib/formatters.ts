export function formatCurrencyZAR(amountInCents: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format((amountInCents || 0) / 100);
}

export function formatCurrencyZAROrDash(
  amountInCents: number | null | undefined,
  emptyFallback: string = '—',
): string {
  if (amountInCents == null) return emptyFallback;
  return formatCurrencyZAR(amountInCents);
}

export function formatKm(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${Number(value).toLocaleString()} km`;
}

export function formatLitres(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${Number(value).toLocaleString()} L`;
}

/** Human-readable short date (e.g. "12 Mar 2025") */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (date == null) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Distance with unit (e.g. "24 500 km") */
export function formatDistanceKm(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${Number(value).toLocaleString('en-ZA')} km`;
}

