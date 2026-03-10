import { getInsforgeClient } from '../lib/insforgeClient';

export interface MaintenanceEntry {
  id: string | number;
  date: string;
  vehicle: string;
  service: string;
  mileage: string | null;
  cost: string | null;
  shop: string | null;
  status: string;
}

const FALLBACK_LOGS: MaintenanceEntry[] = [
  {
    id: 1,
    date: '2023-10-12',
    vehicle: 'Tesla Model 3',
    service: 'Tire Rotation',
    mileage: '24,000',
    cost: '$60.00',
    shop: 'Tesla Service Center',
    status: 'Completed',
  },
  {
    id: 2,
    date: '2023-09-28',
    vehicle: 'Honda Civic',
    service: 'Oil Change (Synthetic)',
    mileage: '65,100',
    cost: '$85.00',
    shop: 'Jiffy Lube',
    status: 'Completed',
  },
  {
    id: 3,
    date: '2023-08-15',
    vehicle: 'Ford F-150',
    service: 'Brake Pad Replacement',
    mileage: '42,500',
    cost: '$350.00',
    shop: 'Local Mechanic',
    status: 'Completed',
  },
  {
    id: 4,
    date: '2023-04-05',
    vehicle: 'Tesla Model 3',
    service: 'Cabin Air Filter',
    mileage: '18,500',
    cost: '$45.00',
    shop: 'DIY',
    status: 'Completed',
  },
  {
    id: 5,
    date: '2023-02-10',
    vehicle: 'Honda Civic',
    service: 'Transmission Fluid',
    mileage: '60,000',
    cost: '$120.00',
    shop: 'Honda Dealership',
    status: 'Completed',
  },
];

export async function fetchAccountMaintenanceLogs(): Promise<MaintenanceEntry[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('maintenance_logs')
      .select(
        'id, service_date, mileage, cost_cents, currency, vendor_name, type, vehicles(make, model)',
      )
      .order('service_date', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load maintenance logs from backend, using fallback data.', error);
      return FALLBACK_LOGS;
    }

    return (data as any[]).map((row) => {
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? `${row.vehicles.make} ${row.vehicles.model}`
          : 'Vehicle';
      const mileage =
        row.mileage != null ? Number(row.mileage).toLocaleString() : null;
      const cost =
        row.cost_cents != null
          ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.currency ?? 'USD',
          }).format(row.cost_cents / 100)
          : null;

      return {
        id: row.id,
        date: row.service_date,
        vehicle: vehicleName,
        service: row.type,
        mileage,
        cost,
        shop: row.vendor_name ?? null,
        status: 'Completed',
      } as MaintenanceEntry;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Maintenance service unavailable, using fallback data.', err);
    return FALLBACK_LOGS;
  }
}

