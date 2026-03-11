export function cssVarHsl(name: string, fallbackHslTriplet: string) {
  if (typeof window === 'undefined') return `hsl(${fallbackHslTriplet})`;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw ? `hsl(${raw})` : `hsl(${fallbackHslTriplet})`;
}

export const chartColors = {
  primary: () => cssVarHsl('--chart-1', '358 79% 50%'),
  accent: () => cssVarHsl('--chart-2', '217 91% 60%'),
  muted: () => cssVarHsl('--chart-3', '215 20% 65%'),
  border: () => cssVarHsl('--border', '214 32% 91%'),
};

