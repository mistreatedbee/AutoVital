import { getInsforgeClient } from '../lib/insforgeClient';
import type { Vehicle, VehicleImage, VehicleHealthSnapshot } from '../domain/models';

interface VehicleSummary {
  id: string;
  name: string;
  year: number | null;
  mileage: string | null;
  type: string | null;
  health: number | null;
  nextService: string | null;
  imageUrl: string | null;
  status: 'optimal' | 'warning' | 'unknown';
}

export interface VehicleDetailsData {
  vehicle: Vehicle;
  images: VehicleImage[];
  health: {
    score: number | null;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
    lastUpdatedAt: string | null;
  };
}

export interface UpsertVehicleInput {
  id?: string;
  accountId: string;
  ownerUserId: string | null;
  nickname: string | null;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  fuelType: string | null;
  currentMileage: number | null;
}

const FALLBACK_VEHICLES: VehicleSummary[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    year: 2022,
    mileage: '24,500',
    type: 'Electric',
    health: 98,
    nextService: 'Tire Rotation (in 500 mi)',
    imageUrl:
      'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?q=80&w=800&auto=format&fit=crop',
    status: 'optimal',
  },
  {
    id: '2',
    name: 'Honda Civic',
    year: 2018,
    mileage: '68,200',
    type: 'Gasoline',
    health: 82,
    nextService: 'Oil Change (Due Now)',
    imageUrl:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
    status: 'warning',
  },
  {
    id: '3',
    name: 'Ford F-150',
    year: 2020,
    mileage: '45,100',
    type: 'Gasoline',
    health: 95,
    nextService: 'Brake Inspection (in 2,000 mi)',
    imageUrl:
      'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800&auto=format&fit=crop',
    status: 'optimal',
  },
];

export type { VehicleSummary };

function deriveHealthStatus(score: number | null): 'optimal' | 'warning' | 'unknown' {
  if (score == null) return 'unknown';
  if (score >= 90) return 'optimal';
  if (score >= 80) return 'warning';
  return 'unknown';
}

export async function fetchAccountVehicles(accountId: string | null): Promise<VehicleSummary[]> {
  if (!accountId) {
    return FALLBACK_VEHICLES;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('vehicles')
      .select('id, make, model, year, current_mileage, fuel_type, health_score, hero_image_url, archived_at')
      .eq('account_id', accountId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicles from backend, using fallback data.', error);
      return FALLBACK_VEHICLES;
    }

    return (data as any[]).map((v) => {
      const mileageNumber =
        v.current_mileage != null ? Number(v.current_mileage) : null;
      const mileage = mileageNumber != null ? mileageNumber.toLocaleString() : null;
      const health = v.health_score != null ? Number(v.health_score) : null;

      return {
        id: v.id,
        name: `${v.year ?? ''} ${v.make} ${v.model}`.trim(),
        year: v.year ?? null,
        mileage,
        type: v.fuel_type ?? null,
        health,
        nextService: null,
        imageUrl: v.hero_image_url ?? null,
        status: deriveHealthStatus(health),
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicles service unavailable, using fallback data.', err);
    return FALLBACK_VEHICLES;
  }
}

export async function fetchVehicleDetails(
  accountId: string | null,
  vehicleId: string,
): Promise<VehicleDetailsData | null> {
  if (!accountId) {
    return null;
  }

  try {
    const client = getInsforgeClient();

    const { data: vehicleRows, error: vehicleError } = await client.database
      .from('vehicles')
      .select('*')
      .eq('account_id', accountId)
      .eq('id', vehicleId)
      .limit(1);

    if (vehicleError || !vehicleRows || vehicleRows.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('Vehicle not found for details view.', vehicleError);
      return null;
    }

    const vehicleRow = vehicleRows[0] as any;

    const { data: imageRows, error: imageError } = await client.database
      .from('vehicle_images')
      .select('*')
      .eq('account_id', accountId)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: true });

    if (imageError) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicle images.', imageError);
    }

    const { data: healthRows, error: healthError } = await client.database
      .from('vehicle_health_snapshots')
      .select('*')
      .eq('account_id', accountId)
      .eq('vehicle_id', vehicleId)
      .order('snapshot_date', { ascending: false })
      .limit(1);

    if (healthError) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicle health snapshot.', healthError);
    }

    const healthSnapshot: VehicleHealthSnapshot | undefined =
      healthRows && healthRows[0]
        ? {
            id: healthRows[0].id,
            vehicleId: healthRows[0].vehicle_id,
            accountId: healthRows[0].account_id,
            score: Number(healthRows[0].score),
            snapshotDate: healthRows[0].snapshot_date,
            createdAt: healthRows[0].created_at,
          }
        : undefined;
    const score: number | null =
      vehicleRow.health_score != null
        ? Number(vehicleRow.health_score)
        : healthSnapshot
          ? healthSnapshot.score
          : null;

    const healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' = (() => {
      if (score == null) return 'unknown';
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      if (score >= 40) return 'fair';
      return 'poor';
    })();

    const vehicle: Vehicle = {
      id: vehicleRow.id,
      accountId: vehicleRow.account_id,
      ownerUserId: vehicleRow.owner_user_id,
      nickname: vehicleRow.nickname,
      make: vehicleRow.make,
      model: vehicleRow.model,
      year: vehicleRow.year,
      vin: vehicleRow.vin,
      licensePlate: vehicleRow.license_plate,
      fuelType: vehicleRow.fuel_type,
      currentMileage:
        vehicleRow.current_mileage != null
          ? Number(vehicleRow.current_mileage)
          : null,
      healthScore:
        vehicleRow.health_score != null ? Number(vehicleRow.health_score) : null,
      heroImageUrl: vehicleRow.hero_image_url ?? null,
      createdAt: vehicleRow.created_at,
      updatedAt: vehicleRow.updated_at,
      archivedAt: vehicleRow.archived_at,
    };

    const images: VehicleImage[] = (imageRows ?? []).map((row: any) => ({
      id: row.id,
      vehicleId: row.vehicle_id,
      accountId: row.account_id,
      url: row.url,
      storageBucket: row.storage_bucket ?? null,
      storageKey: row.storage_key ?? null,
      provider: row.provider ?? null,
      isPrimary: row.is_primary ?? false,
      createdAt: row.created_at,
    }));

    return {
      vehicle,
      images,
      health: {
        score,
        status: healthStatus,
        lastUpdatedAt: healthSnapshot ? healthSnapshot.createdAt : vehicle.updatedAt,
      },
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load vehicle details.', err);
    return null;
  }
}

export async function upsertVehicle(input: UpsertVehicleInput): Promise<Vehicle | null> {
  const client = getInsforgeClient();

  const payload = {
    account_id: input.accountId,
    owner_user_id: input.ownerUserId,
    nickname: input.nickname,
    make: input.make,
    model: input.model,
    year: input.year,
    vin: input.vin,
    license_plate: input.licensePlate,
    fuel_type: input.fuelType,
    current_mileage: input.currentMileage,
  };

  try {
    let result;
    if (input.id) {
      result = await client.database
        .from('vehicles')
        .update(payload)
        .eq('id', input.id)
        .eq('account_id', input.accountId)
        .select('*')
        .limit(1);
    } else {
      result = await client.database.from('vehicles').insert([payload]).select('*').limit(1);
    }

    const { data, error } = result;

    if (error || !data || !data[0]) {
      // eslint-disable-next-line no-console
      console.warn('Failed to upsert vehicle.', error);
      return null;
    }

    const row = data[0] as any;

    return {
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicle upsert failed.', err);
    return null;
  }
}

export async function archiveVehicle(accountId: string, vehicleId: string): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('vehicles')
      .update({ archived_at: new Date().toISOString() })
      .eq('account_id', accountId)
      .eq('id', vehicleId);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to archive vehicle.', error);
      return false;
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicle archive failed.', err);
    return false;
  }
}
