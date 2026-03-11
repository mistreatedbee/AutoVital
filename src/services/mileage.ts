import { getInsforgeClient } from '../lib/insforgeClient';
import type { MileageLog } from '../domain/models';

export interface MileageHistoryPoint {
  date: string;
  odometer: number;
  source: string;
  note: string | null;
}

export async function fetchVehicleMileageHistory(
  accountId: string,
  vehicleId: string,
): Promise<MileageHistoryPoint[]> {
  const client = getInsforgeClient();

  const { data, error } = await client.database
    .from('mileage_logs')
    .select('log_date, odometer, source, note')
    .eq('account_id', accountId)
    .eq('vehicle_id', vehicleId)
    .order('log_date', { ascending: true });

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load mileage history.', error);
    return [];
  }

  return (data as any[]).map((row) => ({
    date: row.log_date,
    odometer: Number(row.odometer),
    source: row.source,
    note: row.note ?? null,
  }));
}

export interface CreateMileageLogInput {
  accountId: string;
  vehicleId: string;
  userId: string | null;
  logDate: string;
  odometer: number;
  source?: string;
  note?: string | null;
}

export async function createMileageLog(input: CreateMileageLogInput): Promise<MileageLog | null> {
  const client = getInsforgeClient();

  const payload = {
    account_id: input.accountId,
    vehicle_id: input.vehicleId,
    user_id: input.userId,
    log_date: input.logDate,
    odometer: input.odometer,
    source: input.source ?? 'manual',
    note: input.note ?? null,
  };

  const { data, error } = await client.database
    .from('mileage_logs')
    .insert([payload])
    .select('*')
    .limit(1);

  if (error || !data || !data[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create mileage log.', error);
    return null;
  }

  const row = data[0] as any;

  return {
    id: row.id,
    accountId: row.account_id,
    vehicleId: row.vehicle_id,
    userId: row.user_id,
    logDate: row.log_date,
    odometer: Number(row.odometer),
    source: row.source,
    note: row.note ?? null,
    createdAt: row.created_at,
  };
}

export async function updateVehicleCurrentMileageIfHigher(
  accountId: string,
  vehicleId: string,
  odometer: number,
): Promise<void> {
  const client = getInsforgeClient();

  const { data, error } = await client.database
    .from('vehicles')
    .select('id, current_mileage')
    .eq('account_id', accountId)
    .eq('id', vehicleId)
    .maybeSingle();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load vehicle for mileage update.', error);
    return;
  }

  const current = data.current_mileage != null ? Number(data.current_mileage) : null;
  if (current != null && current >= odometer) {
    return;
  }

  const { error: updateError } = await client.database
    .from('vehicles')
    .update({ current_mileage: odometer })
    .eq('account_id', accountId)
    .eq('id', vehicleId);

  if (updateError) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update vehicle current mileage.', updateError);
  }
}


