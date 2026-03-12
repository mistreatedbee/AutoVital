import { getInsforgeClient } from '../lib/insforgeClient';
import { formatCurrencyZAR, formatCurrencyZAROrDash } from '../lib/formatters';
import {
  type PaginatedParams,
  type PaginatedResult,
  toLimitOffset,
  DEFAULT_PAGE_SIZE,
} from '../lib/pagination';

export interface AdminVehicleRow {
  id: string;
  accountId: string;
  accountName: string;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  mileage: string | null;
  healthScore: number | null;
  createdAt: string;
  ownerEmail: string | null;
  lastServiceDate: string | null;
  nextServiceDue: string | null;
  documentCount: number;
  pendingAlertCount: number;
}

export interface AdminVehicleDetail extends AdminVehicleRow {
  accountId: string;
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

function mapAdminVehicleRow(row: Record<string, unknown>): AdminVehicleRow {
  const mileage =
    row.current_mileage != null ? Number(row.current_mileage).toLocaleString() : null;
  const health = row.health_score != null ? Number(row.health_score) : null;
  const lastService =
    row.last_service_date != null ? String(row.last_service_date).slice(0, 10) : null;
  const nextService =
    row.next_service_due != null ? String(row.next_service_due).slice(0, 10) : null;
  return {
    id: row.id as string,
    accountId: (row.account_id as string) ?? '',
    accountName: (row.account_name as string) ?? 'Account',
    make: row.make as string,
    model: row.model as string,
    year: (row.year as number) ?? null,
    vin: (row.vin as string) ?? null,
    licensePlate: (row.license_plate as string) ?? null,
    mileage,
    healthScore: health,
    createdAt: row.created_at as string,
    ownerEmail: (row.owner_email as string) ?? null,
    lastServiceDate: lastService,
    nextServiceDue: nextService,
    documentCount: Number(row.document_count ?? 0),
    pendingAlertCount: Number(row.pending_alert_count ?? 0),
  };
}

export async function fetchAdminVehicles(
  params: AdminVehicleFilters = {},
): Promise<PaginatedResult<AdminVehicleRow>> {
  const { limit, offset, page, pageSize } = toLimitOffset(params);
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('admin_vehicles_view')
      .select(
        'id, account_id, account_name, make, model, year, vin, license_plate, current_mileage, health_score, created_at, owner_email, last_service_date, next_service_due, document_count, pending_alert_count',
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
      console.warn('Failed to load admin vehicles (admin_vehicles_view).', error);
      return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
    }

    const items = (data as any[]).map((r) => mapAdminVehicleRow(r as Record<string, unknown>));
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin vehicles service failed.', err);
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }
}

export async function fetchAdminVehicleDetail(
  vehicleId: string,
): Promise<AdminVehicleDetail | null> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('admin_vehicles_view')
      .select(
        'id, account_id, account_name, make, model, year, vin, license_plate, current_mileage, health_score, created_at, owner_email, last_service_date, next_service_due, document_count, pending_alert_count',
      )
      .eq('id', vehicleId)
      .maybeSingle();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin vehicle detail.', error);
      return null;
    }

    const row = data as Record<string, unknown>;
    return {
      ...mapAdminVehicleRow(row),
      accountId: row.account_id as string,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin vehicle detail failed.', err);
    return null;
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
      const cost = row.cost_cents != null ? formatCurrencyZAR(row.cost_cents) : null;

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
      const totalCost = formatCurrencyZAROrDash(row.total_cost_cents, 'R0.00');
      const pricePerUnit =
        row.volume && row.total_cost_cents
          ? formatCurrencyZAR(
              Math.round(row.total_cost_cents / Number(row.volume)),
            )
          : 'R0.00';
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
