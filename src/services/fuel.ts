import { getInsforgeClient } from '../lib/insforgeClient';
import { rowToFuelLogEntry, type FuelLogEntry, type FuelLogDbRow } from '../lib/dbMappers';
import { createMileageLog, updateVehicleCurrentMileageIfHigher } from './mileage';

export type { FuelLogEntry };

export interface EfficiencyPoint {
  date: string;
  mpg: number;
}

export interface EfficiencyPointWithUnits extends EfficiencyPoint {
  lPer100km?: number;
  kmPerL?: number;
}

export async function fetchFuelEfficiency(
  accountId: string | null,
): Promise<EfficiencyPoint[]> {
  if (!accountId) return [];

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('fuel_logs')
      .select('fill_date, volume, total_cost_cents, odometer')
      .eq('account_id', accountId)
      .order('fill_date', { ascending: true });

    if (error || !data || data.length < 2) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load fuel efficiency from backend.', error);
      return [];
    }

    const points: EfficiencyPoint[] = [];
    const rows = data as { fill_date: string; odometer?: number | null; volume?: number | null }[];
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      if (prev.odometer == null || curr.odometer == null || curr.volume == null) continue;
      const miles = Number(curr.odometer) - Number(prev.odometer);
      const gallons = Number(curr.volume);
      if (miles > 0 && gallons > 0) {
        points.push({
          date: curr.fill_date,
          mpg: Number((miles / gallons).toFixed(1)),
        });
      }
    }

    return points;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fuel efficiency service unavailable.', err);
    return [];
  }
}

export async function fetchFuelLogs(
  accountId: string | null,
  vehicleId?: string,
): Promise<FuelLogEntry[]> {
  if (!accountId) return [];

  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('fuel_logs')
      .select('id, fill_date, odometer, volume, total_cost_cents, currency, vehicles(make, model)')
      .eq('account_id', accountId)
      .order('fill_date', { ascending: false });

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    const { data, error } = await query;

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load fuel logs from backend.', error);
      return [];
    }

    return (data as FuelLogDbRow[]).map(rowToFuelLogEntry);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fuel logs service unavailable.', err);
    return [];
  }
}

export function calculateFuelEfficiencyWithUnits(
  points: EfficiencyPoint[],
  measurementSystem: 'imperial' | 'metric',
): EfficiencyPointWithUnits[] {
  if (measurementSystem === 'imperial') {
    return points;
  }

  return points.map((p) => {
    const mpg = p.mpg;
    const lPer100km = Number((235.214583 / mpg).toFixed(1));
    const kmPerL = Number((mpg * 0.425144).toFixed(2));
    return {
      ...p,
      lPer100km,
      kmPerL,
    };
  });
}

export interface CreateFuelLogInput {
  accountId: string;
  vehicleId: string;
  userId: string | null;
  fillDate: string;
  odometer?: number | null;
  volume: number;
  totalCostCents: number;
  currency?: string | null;
  notes?: string | null;
}

export async function createFuelLogWithMileage(
  input: CreateFuelLogInput,
): Promise<void> {
  const client = getInsforgeClient();

  const pricePerUnitCents =
    input.volume > 0 ? Math.round(input.totalCostCents / input.volume) : null;

  const payload = {
    account_id: input.accountId,
    vehicle_id: input.vehicleId,
    user_id: input.userId,
    fill_date: input.fillDate,
    odometer: input.odometer ?? null,
    volume: input.volume,
    total_cost_cents: input.totalCostCents,
    price_per_unit_cents: pricePerUnitCents,
    currency: input.currency ?? 'USD',
    notes: input.notes ?? null,
  };

  const { error } = await client.database.from('fuel_logs').insert([payload]);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create fuel log.', error);
    return;
  }

  if (input.odometer != null && input.odometer >= 0) {
    const today = new Date().toISOString().slice(0, 10);
    const mileageLog = await createMileageLog({
      accountId: input.accountId,
      vehicleId: input.vehicleId,
      userId: input.userId,
      logDate: input.fillDate || today,
      odometer: input.odometer,
      source: 'fuel_fill',
      note: input.notes ?? null,
    });

    if (mileageLog) {
      await updateVehicleCurrentMileageIfHigher(
        input.accountId,
        input.vehicleId,
        input.odometer,
      );
    }
  }
}

