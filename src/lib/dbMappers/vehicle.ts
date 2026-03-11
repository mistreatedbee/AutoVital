import type { Vehicle, VehicleImage, VehicleHealthSnapshot } from '../../domain/models';

export interface VehicleSummary {
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

export interface VehicleDbRow {
  id: string;
  account_id: string;
  owner_user_id?: string | null;
  nickname?: string | null;
  make: string;
  model: string;
  year?: number | null;
  vin?: string | null;
  license_plate?: string | null;
  fuel_type?: string | null;
  current_mileage?: number | string | null;
  transmission?: string | null;
  engine_type?: string | null;
  color?: string | null;
  health_score?: number | string | null;
  hero_image_url?: string | null;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

/** Partial row for list queries (fewer columns selected) */
export interface VehicleListDbRow
  extends Pick<
    VehicleDbRow,
    | 'id'
    | 'make'
    | 'model'
    | 'year'
    | 'current_mileage'
    | 'fuel_type'
    | 'health_score'
    | 'hero_image_url'
  > {}

export interface VehicleImageDbRow {
  id: string;
  vehicle_id: string;
  account_id: string;
  url: string;
  storage_bucket?: string | null;
  storage_key?: string | null;
  provider?: string | null;
  is_primary?: boolean;
  created_at: string;
}

export interface VehicleHealthSnapshotDbRow {
  id: string;
  vehicle_id: string;
  account_id: string;
  score: number | string;
  snapshot_date: string;
  created_at: string;
}

function deriveHealthStatus(score: number | null): 'optimal' | 'warning' | 'unknown' {
  if (score == null) return 'unknown';
  if (score >= 90) return 'optimal';
  if (score >= 80) return 'warning';
  return 'unknown';
}

export function rowToVehicle(row: VehicleDbRow): Vehicle {
  return {
    id: row.id,
    accountId: row.account_id,
    ownerUserId: row.owner_user_id ?? null,
    nickname: row.nickname ?? null,
    make: row.make,
    model: row.model,
    year: row.year ?? null,
    vin: row.vin ?? null,
    licensePlate: row.license_plate ?? null,
    fuelType: row.fuel_type ?? null,
    currentMileage:
      row.current_mileage != null ? Number(row.current_mileage) : null,
    transmission: row.transmission ?? null,
    engineType: row.engine_type ?? null,
    color: row.color ?? null,
    healthScore: row.health_score != null ? Number(row.health_score) : null,
    heroImageUrl: row.hero_image_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at ?? null,
  };
}

export function rowToVehicleSummary(
  row: VehicleDbRow | VehicleListDbRow,
): VehicleSummary {
  const mileageNumber =
    row.current_mileage != null ? Number(row.current_mileage) : null;
  const mileage = mileageNumber != null ? mileageNumber.toLocaleString() : null;
  const health = row.health_score != null ? Number(row.health_score) : null;

  return {
    id: row.id,
    name: `${row.year ?? ''} ${row.make} ${row.model}`.trim(),
    year: row.year ?? null,
    mileage,
    type: row.fuel_type ?? null,
    health,
    nextService: null,
    imageUrl: row.hero_image_url ?? null,
    status: deriveHealthStatus(health),
  };
}

export function rowToVehicleImage(row: VehicleImageDbRow): VehicleImage {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    accountId: row.account_id,
    url: row.url,
    storageBucket: row.storage_bucket ?? null,
    storageKey: row.storage_key ?? null,
    provider: row.provider ?? null,
    isPrimary: row.is_primary ?? false,
    createdAt: row.created_at,
  };
}

export function rowToVehicleHealthSnapshot(
  row: VehicleHealthSnapshotDbRow,
): VehicleHealthSnapshot {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    accountId: row.account_id,
    score: Number(row.score),
    snapshotDate: row.snapshot_date,
    createdAt: row.created_at,
  };
}
