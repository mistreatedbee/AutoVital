import { getInsforgeClient } from '../lib/insforgeClient';
import type { Vehicle } from '../domain/models';
import { rowToVehicle } from '../lib/dbMappers';
import type { VehicleDbRow } from '../lib/dbMappers';
import { rowToMaintenanceEntry, type MaintenanceEntry, type MaintenanceLogDbRow } from '../lib/dbMappers';
import { recomputeAndPersistVehicleHealth } from './vehicleHealth';
import { createMileageLog, updateVehicleCurrentMileageIfHigher } from './mileage';
import { toLimitOffset, type PaginatedParams, type PaginatedResult, DEFAULT_PAGE_SIZE } from '../lib/pagination';

export type { MaintenanceEntry };

export async function fetchAccountMaintenanceLogs(
  accountId: string | null,
  params?: PaginatedParams,
): Promise<PaginatedResult<MaintenanceEntry>> {
  if (!accountId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    const q = client.database
      .from('maintenance_logs')
      .select(
        'id, vehicle_id, service_date, mileage, cost_cents, currency, vendor_name, type, document_id, vehicles(make, model)',
      )
      .eq('account_id', accountId)
      .order('service_date', { ascending: false });

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load maintenance logs from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as MaintenanceLogDbRow[]).map(rowToMaintenanceEntry);
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Maintenance service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
  }
}

export interface CreateMaintenanceLogInput {
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
  documentId?: string | null;
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
    currency: input.currency ?? 'ZAR',
    vendor_name: input.vendorName ?? null,
    document_id: input.documentId ?? null,
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

  const vehicle = rowToVehicle(vehicleRows[0] as VehicleDbRow);

  await recomputeAndPersistVehicleHealth(vehicle, input.serviceDate);

  if (input.mileage != null && input.mileage >= 0) {
    const today = new Date().toISOString().slice(0, 10);
    const mileageLog = await createMileageLog({
      accountId: input.accountId,
      vehicleId: input.vehicleId,
      userId: input.userId,
      logDate: input.serviceDate || today,
      odometer: input.mileage,
      source: 'maintenance',
      note: input.description ?? null,
    });

    if (mileageLog) {
      await updateVehicleCurrentMileageIfHigher(
        input.accountId,
        input.vehicleId,
        input.mileage,
      );
    }
  }
}

export async function fetchVehicleMaintenanceLogs(
  accountId: string,
  vehicleId: string,
  params?: PaginatedParams,
): Promise<PaginatedResult<MaintenanceEntry>> {
  if (!accountId || !vehicleId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    const q = client.database
      .from('maintenance_logs')
      .select(
        'id, vehicle_id, service_date, mileage, cost_cents, currency, vendor_name, type, document_id, vehicles(make, model)',
      )
      .eq('account_id', accountId)
      .eq('vehicle_id', vehicleId)
      .order('service_date', { ascending: false });

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicle maintenance logs from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as MaintenanceLogDbRow[]).map(rowToMaintenanceEntry);
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicle maintenance service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
  }
}

export interface UpdateMaintenanceLogInput {
  type?: string;
  description?: string | null;
  mileage?: number | null;
  serviceDate?: string;
  costCents?: number | null;
  currency?: string | null;
  vendorName?: string | null;
  documentId?: string | null;
}

export async function updateMaintenanceLog(
  accountId: string,
  logId: string,
  input: UpdateMaintenanceLogInput,
): Promise<boolean> {
  const client = getInsforgeClient();

  const payload: Record<string, unknown> = {};
  if (input.type !== undefined) payload.type = input.type;
  if (input.description !== undefined) payload.description = input.description;
  if (input.mileage !== undefined) payload.mileage = input.mileage;
  if (input.serviceDate !== undefined) payload.service_date = input.serviceDate;
  if (input.costCents !== undefined) payload.cost_cents = input.costCents;
  if (input.currency !== undefined) payload.currency = input.currency;
  if (input.vendorName !== undefined) payload.vendor_name = input.vendorName;
  if (input.documentId !== undefined) payload.document_id = input.documentId;

  if (Object.keys(payload).length === 0) {
    return true;
  }

  const { error } = await client.database
    .from('maintenance_logs')
    .update(payload)
    .eq('id', logId)
    .eq('account_id', accountId);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update maintenance log.', error);
    return false;
  }

  return true;
}

