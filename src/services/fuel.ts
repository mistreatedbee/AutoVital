import { getInsforgeClient } from '../lib/insforgeClient';
import { rowToFuelLogEntry, type FuelLogEntry, type FuelLogDbRow } from '../lib/dbMappers';
import { createMileageLog, updateVehicleCurrentMileageIfHigher } from './mileage';
import { toLimitOffset, type PaginatedParams, type PaginatedResult, DEFAULT_PAGE_SIZE } from '../lib/pagination';

export type { FuelLogEntry };

export interface EfficiencyPoint {
  date: string;
  mpg: number;
  lPer100km?: number;
  kmPerL?: number;
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
      const km = Number(curr.odometer) - Number(prev.odometer);
      const litres = Number(curr.volume);
      if (km > 0 && litres > 0) {
        const kmPerL = km / litres;
        const lPer100km = (litres / km) * 100;
        // Derive MPG for imperial displays, but base calculations on km and litres.
        const miles = km * 0.621371;
        const gallons = litres * 0.264172;
        const mpg = miles > 0 && gallons > 0 ? miles / gallons : 0;

        points.push({
          date: curr.fill_date,
          mpg: Number(mpg.toFixed(1)),
          lPer100km: Number(lPer100km.toFixed(1)),
          kmPerL: Number(kmPerL.toFixed(2)),
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
  params?: PaginatedParams,
): Promise<PaginatedResult<FuelLogEntry>> {
  if (!accountId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    let q = client.database
      .from('fuel_logs')
      .select('id, fill_date, odometer, volume, total_cost_cents, currency, vehicles(make, model)')
      .eq('account_id', accountId)
      .order('fill_date', { ascending: false });

    if (vehicleId) {
      q = q.eq('vehicle_id', vehicleId);
    }

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load fuel logs from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as FuelLogDbRow[]).map(rowToFuelLogEntry);
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fuel logs service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
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
    if (p.lPer100km != null && p.kmPerL != null) {
      return p;
    }
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
    currency: input.currency ?? 'ZAR',
    notes: input.notes ?? null,
  };

  const { error } = await client.database.from('fuel_logs').insert([payload]);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create fuel log.', error);
    throw new Error('Unable to save fuel record.');
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
