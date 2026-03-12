import { formatCurrencyZAR, formatCurrencyZAROrDash } from '../formatters';

export interface FuelLogEntry {
  id: string | number;
  date: string;
  vehicle: string;
  gallons: string;
  cost: string;
  ppg: string;
  mileage: string;
}

export interface FuelLogDbRow {
  id: string;
  fill_date: string;
  odometer?: number | string | null;
  volume?: number | string | null;
  total_cost_cents?: number | null;
  currency?: string;
  vehicles?: { make?: string; model?: string } | null;
}

export function rowToFuelLogEntry(row: FuelLogDbRow): FuelLogEntry {
  const vehicleName =
    row.vehicles?.make && row.vehicles?.model
      ? `${row.vehicles.make} ${row.vehicles.model}`
      : 'Vehicle';
  const gallons = row.volume != null ? String(row.volume) : '0';
  const totalCost = formatCurrencyZAROrDash(row.total_cost_cents, 'R0.00');
  const ppg =
    row.volume && row.total_cost_cents
      ? formatCurrencyZAR(
          Math.round(row.total_cost_cents / Number(row.volume)),
        )
      : 'R0.00';
  const mileage =
    row.odometer != null ? Number(row.odometer).toLocaleString() : '0';

  return {
    id: row.id,
    date: row.fill_date,
    vehicle: vehicleName,
    gallons,
    cost: totalCost,
    ppg,
    mileage,
  };
}
