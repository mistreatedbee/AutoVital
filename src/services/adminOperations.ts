import { getInsforgeClient } from '../lib/insforgeClient';
import {
  type PaginatedParams,
  type PaginatedResult,
  toLimitOffset,
  DEFAULT_PAGE_SIZE,
} from '../lib/pagination';

export interface AdminVehicleRow {
  id: string;
  accountName: string;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  mileage: string | null;
  healthScore: number | null;
  createdAt: string;
}

export interface AdminMaintenanceRow {
  id: string;
  accountName: string;
  vehicleName: string;
  serviceType: string;
  serviceDate: string;
  mileage: string | null;
  cost: string | null;
  vendorName: string | null;
}

export interface AdminFuelRow {
  id: string;
  accountName: string;
  vehicleName: string;
  fillDate: string;
  volume: string;
  totalCost: string;
  pricePerUnit: string;
  odometer: string | null;
}

export interface AdminDocumentRow {
  id: string;
  accountName: string;
  name: string;
  type: string;
  size: string;
  createdAt: string;
  vehicleName: string;
  url: string | null;
}

export interface AdminVehicleFilters extends PaginatedParams {
  accountId?: string;
  includeArchived?: boolean;
}

export async function fetchAdminVehicles(
  params: AdminVehicleFilters = {},
): Promise<PaginatedResult<AdminVehicleRow>> {
  const { limit, offset, page, pageSize } = toLimitOffset(params);
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('vehicles')
      .select(
        'id, make, model, year, vin, current_mileage, health_score, created_at, accounts(name)',
      )
      .order('created_at', { ascending: false });

    if (params.accountId) {
      query = query.eq('account_id', params.accountId);
    }
    if (!params.includeArchived) {
      query = query.is('archived_at', null);
    }

    const q = query as { range?: (a: number, b: number) => typeof query };
    const { data, error } = await (q.range ? q.range(offset, offset + limit - 1) : query);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin vehicles.', error);
      return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
    }

    const items = (data as any[]).map((row) => {
      const mileage =
        row.current_mileage != null ? Number(row.current_mileage).toLocaleString() : null;
      const health = row.health_score != null ? Number(row.health_score) : null;

      return {
        id: row.id,
        accountName: row.accounts?.name ?? 'Account',
        make: row.make,
        model: row.model,
        year: row.year ?? null,
        vin: row.vin ?? null,
        mileage,
        healthScore: health,
        createdAt: row.created_at,
      } as AdminVehicleRow;
    });

    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin vehicles service failed.', err);
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }
}

export interface AdminMaintenanceFilters extends PaginatedParams {
  accountId?: string;
  vehicleId?: string;
  type?: string;
}

export async function fetchAdminMaintenanceLogs(
  params: AdminMaintenanceFilters = {},
): Promise<PaginatedResult<AdminMaintenanceRow>> {
  const { limit, offset, page, pageSize } = toLimitOffset(params);
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('maintenance_logs')
      .select(
        'id, service_date, mileage, cost_cents, currency, vendor_name, type, accounts(name), vehicles(make, model)',
      )
      .order('service_date', { ascending: false });

    if (params.accountId) query = query.eq('account_id', params.accountId);
    if (params.vehicleId) query = query.eq('vehicle_id', params.vehicleId);
    if (params.type) query = query.eq('type', params.type);

    const mq = query as { range?: (a: number, b: number) => typeof query };
    const { data, error } = await (mq.range ? mq.range(offset, offset + limit - 1) : query);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin maintenance logs.', error);
      return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
    }

    const items = (data as any[]).map((row) => {
      const accountName = row.accounts?.name ?? 'Account';
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
        accountName,
        vehicleName,
        serviceType: row.type,
        serviceDate: row.service_date,
        mileage,
        cost,
        vendorName: row.vendor_name ?? null,
      } as AdminMaintenanceRow;
    });

    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin maintenance service failed.', err);
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }
}

export interface AdminFuelFilters extends PaginatedParams {
  accountId?: string;
  vehicleId?: string;
}

export async function fetchAdminFuelLogs(
  params: AdminFuelFilters = {},
): Promise<PaginatedResult<AdminFuelRow>> {
  const { limit, offset, page, pageSize } = toLimitOffset(params);
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('fuel_logs')
      .select(
        'id, fill_date, odometer, volume, total_cost_cents, currency, accounts(name), vehicles(make, model)',
      )
      .order('fill_date', { ascending: false });

    if (params.accountId) query = query.eq('account_id', params.accountId);
    if (params.vehicleId) query = query.eq('vehicle_id', params.vehicleId);

    const fq = query as { range?: (a: number, b: number) => typeof query };
    const { data, error } = await (fq.range ? fq.range(offset, offset + limit - 1) : query);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin fuel logs.', error);
      return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
    }

    const items = (data as any[]).map((row) => {
      const accountName = row.accounts?.name ?? 'Account';
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? `${row.vehicles.make} ${row.vehicles.model}`
          : 'Vehicle';
      const volume = row.volume != null ? String(row.volume) : '0';
      const totalCost =
        row.total_cost_cents != null
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: row.currency ?? 'USD',
            }).format(row.total_cost_cents / 100)
          : '$0.00';
      const pricePerUnit =
        row.volume && row.total_cost_cents
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: row.currency ?? 'USD',
            }).format(row.total_cost_cents / 100 / Number(row.volume))
          : '$0.00';
      const odometer =
        row.odometer != null ? Number(row.odometer).toLocaleString() : null;

      return {
        id: row.id,
        accountName,
        vehicleName,
        fillDate: row.fill_date,
        volume,
        totalCost,
        pricePerUnit,
        odometer,
      } as AdminFuelRow;
    });

    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin fuel service failed.', err);
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }
}

export interface AdminDocumentFilters extends PaginatedParams {
  accountId?: string;
  vehicleId?: string;
  type?: string;
}

export async function fetchAdminDocuments(
  params: AdminDocumentFilters = {},
): Promise<PaginatedResult<AdminDocumentRow>> {
  const { limit, offset, page, pageSize } = toLimitOffset(params);
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('documents')
      .select(
        'id, name, type, size_bytes, created_at, public_url, accounts(name), vehicles(make, model)',
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (params.accountId) query = query.eq('account_id', params.accountId);
    if (params.vehicleId) query = query.eq('vehicle_id', params.vehicleId);
    if (params.type) query = query.eq('type', params.type);

    const dq = query as { range?: (a: number, b: number) => typeof query };
    const { data, error } = await (dq.range ? dq.range(offset, offset + limit - 1) : query);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin documents.', error);
      return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
    }

    const items = (data as any[]).map((row) => {
      const accountName = row.accounts?.name ?? 'Account';
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? `${row.vehicles.make} ${row.vehicles.model}`
          : 'All';
      const size =
        row.size_bytes != null
          ? `${(Number(row.size_bytes) / (1024 * 1024)).toFixed(1)} MB`
          : '—';

      return {
        id: row.id,
        accountName,
        name: row.name,
        type: row.type,
        size,
        createdAt: row.created_at,
        vehicleName,
        url: row.public_url ?? null,
      } as AdminDocumentRow;
    });

    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin documents service failed.', err);
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }
}
