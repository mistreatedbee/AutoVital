import { getInsforgeClient } from '../lib/insforgeClient';
import { toLimitOffset, type PaginatedParams, type PaginatedResult, DEFAULT_PAGE_SIZE } from '../lib/pagination';
import type { Vehicle, VehicleImage, VehicleHealthSnapshot } from '../domain/models';
import {
  rowToVehicle,
  rowToVehicleSummary,
  rowToVehicleImage,
  rowToVehicleHealthSnapshot,
  type VehicleSummary,
  type VehicleDbRow,
  type VehicleListDbRow,
  type VehicleImageDbRow,
  type VehicleHealthSnapshotDbRow,
} from '../lib/dbMappers';

export type { VehicleSummary };

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
  transmission?: string | null;
  engineType?: string | null;
  color?: string | null;
}

export async function fetchAccountVehicles(
  accountId: string | null,
  params?: PaginatedParams,
): Promise<PaginatedResult<VehicleSummary>> {
  if (!accountId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    const q = client.database
      .from('vehicles')
      .select('id, make, model, year, current_mileage, fuel_type, health_score, hero_image_url, archived_at')
      .eq('account_id', accountId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicles from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as VehicleListDbRow[]).map(rowToVehicleSummary);
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicles service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
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

    const vehicleRow = vehicleRows[0] as VehicleDbRow;

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
        ? rowToVehicleHealthSnapshot(healthRows[0] as VehicleHealthSnapshotDbRow)
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

    const vehicle = rowToVehicle(vehicleRow);
    const images: VehicleImage[] = (imageRows ?? []).map((row) =>
      rowToVehicleImage(row as VehicleImageDbRow),
    );

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

  const payload: Record<string, unknown> = {
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
  if (input.transmission !== undefined) payload.transmission = input.transmission;
  if (input.engineType !== undefined) payload.engine_type = input.engineType;
  if (input.color !== undefined) payload.color = input.color;

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

    return rowToVehicle(data[0] as VehicleDbRow);
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
