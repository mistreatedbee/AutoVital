import type { Vehicle, VehicleHealthSnapshot } from '../domain/models';
import { getInsforgeClient } from '../lib/insforgeClient';

interface HealthInputs {
  vehicle: Vehicle;
  latestSnapshot: VehicleHealthSnapshot | null;
  lastServiceDate: string | null;
}

export function computeVehicleHealthScore(inputs: HealthInputs): number {
  const { vehicle } = inputs;
  let score = 100;

  const now = new Date();

  // Age factor
  if (vehicle.year != null) {
    const age = now.getFullYear() - vehicle.year;
    if (age > 15) {
      score -= 35;
    } else if (age > 10) {
      score -= 25;
    } else if (age > 5) {
      score -= 15;
    } else if (age > 2) {
      score -= 5;
    }
  }

  // Mileage factor
  if (vehicle.currentMileage != null) {
    const miles = vehicle.currentMileage;
    if (miles > 200_000) {
      score -= 35;
    } else if (miles > 150_000) {
      score -= 25;
    } else if (miles > 100_000) {
      score -= 15;
    } else if (miles > 60_000) {
      score -= 5;
    }
  }

  // Simple maintenance timeliness factor (if we have a last service date)
  if (inputs.lastServiceDate) {
    const lastService = new Date(inputs.lastServiceDate);
    const diffMs = now.getTime() - lastService.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 730) {
      // > 2 years
      score -= 20;
    } else if (diffDays > 365) {
      // 1–2 years
      score -= 10;
    } else if (diffDays > 180) {
      // 6–12 months
      score -= 5;
    }
  }

  // Clamp score
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return Math.round(score);
}

export async function recomputeAndPersistVehicleHealth(
  vehicle: Vehicle,
  lastServiceDate: string | null,
): Promise<Vehicle> {
  const client = getInsforgeClient();

  const score = computeVehicleHealthScore({
    vehicle,
    latestSnapshot: null,
    lastServiceDate,
  });

  const { data, error } = await client.database
    .from('vehicles')
    .update({ health_score: score })
    .eq('id', vehicle.id)
    .eq('account_id', vehicle.accountId)
    .select('*')
    .limit(1);

  if (error || !data || !data[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to persist vehicle health score.', error);
    return vehicle;
  }

  const row = data[0] as any;

  return {
    ...vehicle,
    healthScore: row.health_score ?? score,
  };
}

export async function createVehicleHealthSnapshot(
  vehicle: Vehicle,
  score: number,
): Promise<VehicleHealthSnapshot | null> {
  const client = getInsforgeClient();

  const payload = {
    vehicle_id: vehicle.id,
    account_id: vehicle.accountId,
    score,
    snapshot_date: new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await client.database
    .from('vehicle_health_snapshots')
    .insert([payload])
    .select('*')
    .limit(1);

  if (error || !data || !data[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create vehicle health snapshot.', error);
    return null;
  }

  const row = data[0] as any;

  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    accountId: row.account_id,
    score: Number(row.score),
    snapshotDate: row.snapshot_date,
    createdAt: row.created_at,
  };
}

