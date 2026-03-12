import { formatCurrencyZAROrDash } from '../formatters';

export interface MaintenanceEntry {
  id: string | number;
  vehicleId: string | null;
  date: string;
  vehicle: string;
  service: string;
  mileage: string | null;
  cost: string | null;
  shop: string | null;
  status: string;
  documentId?: string | null;
}

export interface MaintenanceLogDbRow {
  id: string;
  vehicle_id: string | null;
  service_date: string;
  mileage?: number | string | null;
  cost_cents?: number | null;
  currency?: string;
  vendor_name?: string | null;
  type: string;
  document_id?: string | null;
  vehicles?: { make?: string; model?: string } | null;
}

export function rowToMaintenanceEntry(row: MaintenanceLogDbRow): MaintenanceEntry {
  const vehicleName =
    row.vehicles?.make && row.vehicles?.model
      ? `${row.vehicles.make} ${row.vehicles.model}`
      : 'Vehicle';
  const mileage =
    row.mileage != null ? Number(row.mileage).toLocaleString() : null;
  const cost = row.cost_cents != null ? formatCurrencyZAROrDash(row.cost_cents) : null;

  return {
    id: row.id,
    vehicleId: row.vehicle_id ?? null,
    date: row.service_date,
    vehicle: vehicleName,
    service: row.type,
    mileage,
    cost,
    shop: row.vendor_name ?? null,
    status: 'Completed',
    documentId: row.document_id ?? null,
  };
}
