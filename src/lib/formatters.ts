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

