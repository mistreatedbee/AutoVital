import { getInsforgeClient } from '../lib/insforgeClient';
import type { Vehicle } from '../domain/models';
import { recomputeAndPersistVehicleHealth } from './vehicleHealth';

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

export async function fetchAccountMaintenanceLogs(
  accountId: string | null,
): Promise<MaintenanceEntry[]> {
  if (!accountId) {
    return FALLBACK_LOGS;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('maintenance_logs')
      .select(
        'id, vehicle_id, service_date, mileage, cost_cents, currency, vendor_name, type, vehicles(make, model)',
      )
      .eq('account_id', accountId)
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
        vehicleId: row.vehicle_id ?? null,
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

interface CreateMaintenanceLogInput {
  accountId: string;
  vehicleId: string;
  userId: string | null;
  type: string;
  description?: string | null;
  mileage?: number | null;
  serviceDate: string;
  costCents?: number | null;
  currency?: string | null;
  vendorName?: string | null;
}

export async function createMaintenanceLogWithHealthUpdate(
  input: CreateMaintenanceLogInput,
): Promise<void> {
  const client = getInsforgeClient();

  const payload = {
    account_id: input.accountId,
    vehicle_id: input.vehicleId,
    user_id: input.userId,
    type: input.type,
    description: input.description ?? null,
    mileage: input.mileage ?? null,
    service_date: input.serviceDate,
    cost_cents: input.costCents ?? null,
    currency: input.currency ?? 'USD',
    vendor_name: input.vendorName ?? null,
  };

  const { error } = await client.database.from('maintenance_logs').insert([payload]);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create maintenance log.', error);
    return;
  }

  const { data: vehicleRows, error: vehicleError } = await client.database
    .from('vehicles')
    .select('*')
    .eq('account_id', input.accountId)
    .eq('id', input.vehicleId)
    .limit(1);

  if (vehicleError || !vehicleRows || !vehicleRows[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load vehicle for health recompute.', vehicleError);
    return;
  }

  const row = vehicleRows[0] as any;
  const vehicle: Vehicle = {
    id: row.id,
    accountId: row.account_id,
    ownerUserId: row.owner_user_id,
    nickname: row.nickname,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    licensePlate: row.license_plate,
    fuelType: row.fuel_type,
    currentMileage: row.current_mileage != null ? Number(row.current_mileage) : null,
    healthScore: row.health_score != null ? Number(row.health_score) : null,
    heroImageUrl: row.hero_image_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };

  await recomputeAndPersistVehicleHealth(vehicle, input.serviceDate);
}

