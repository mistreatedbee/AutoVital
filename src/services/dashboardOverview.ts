import { getInsforgeClient } from '../lib/insforgeClient';
import { formatCurrencyZAR } from '../lib/formatters';
import type { BillingInvoice } from './billing';
import type { FuelLogEntry } from './fuel';
import type { MaintenanceEntry } from './maintenance';
import type { UserAlert } from './alerts';

export interface OverviewStats {
  vehicleCount: number;
  openAlertCount: number;
  upcomingMaintenanceCount: number;
  monthlyCostTotal: number; // cents
  avgHealthScore: number | null;
}

export type OverviewActivityKind =
  | 'maintenance'
  | 'fuel'
  | 'document'
  | 'alert';

export interface OverviewActivityItem {
  id: string;
  kind: OverviewActivityKind;
  title: string;
  description: string;
  date: string;
}

export interface ExpensePoint {
  month: string;
  amount: number;
}

export interface OverviewVehicle {
  id: string;
  name: string;
  healthScore: number | null;
  currentMileage: number | null;
  heroImageUrl: string | null;
  nextServiceDue: string | null;
}

export interface DashboardOverviewData {
  stats: OverviewStats;
  vehicles: OverviewVehicle[];
  alerts: UserAlert[];
  activity: OverviewActivityItem[];
  expenseSeries: ExpensePoint[];
  invoices: BillingInvoice[];
  documentProfileComplete: boolean;
}

const MONTH_FORMAT = new Intl.DateTimeFormat('en-ZA', {
  month: 'short',
});

function getMonthKey(d: Date): string {
  return MONTH_FORMAT.format(d);
}

export async function fetchDashboardOverview(
  accountId: string | null,
): Promise<DashboardOverviewData | null> {
  if (!accountId) {
    return null;
  }

  const client = getInsforgeClient();

  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 5);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    vehiclesResult,
    alertsResult,
    maintenanceResult,
    fuelResult,
    invoicesResult,
    documentsResult,
    documentsForProfileResult,
  ] = await Promise.allSettled([
    client.database
      .from('vehicles')
      .select('id, make, model, year, health_score, current_mileage, hero_image_url')
      .eq('account_id', accountId)
      .is('archived_at', null)
      .order('created_at', { ascending: false }),
    client.database
      .from('alerts')
      .select('id, kind, status, title, message, vehicle_id, vehicles(make, model)')
      .eq('account_id', accountId)
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false }),
    client.database
      .from('maintenance_logs')
      .select(
        'id, service_date, mileage, cost_cents, currency, vendor_name, type, vehicles(make, model)',
      )
      .eq('account_id', accountId)
      .gte('service_date', thirtyDaysAgo.toISOString().slice(0, 10))
      .order('service_date', { ascending: false }),
    client.database
      .from('fuel_logs')
      .select('id, fill_date, total_cost_cents, currency, vehicles(make, model)')
      .eq('account_id', accountId)
      .gte('fill_date', thirtyDaysAgo.toISOString().slice(0, 10))
      .order('fill_date', { ascending: false }),
    client.database
      .from('billing_invoices')
      .select('id, invoice_date, amount_cents, currency, status')
      .eq('account_id', accountId)
      .gte('invoice_date', sixMonthsAgo.toISOString().slice(0, 10))
      .order('invoice_date', { ascending: false }),
    client.database
      .from('documents')
      .select('id, name, created_at')
      .eq('account_id', accountId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    client.database
      .from('documents')
      .select('id, type, vehicle_id')
      .eq('account_id', accountId)
      .is('deleted_at', null),
  ]);

  const vehiclesData =
    vehiclesResult.status === 'fulfilled' && !vehiclesResult.value.error
      ? (vehiclesResult.value.data as any[])
      : [];

  const alertsRows =
    alertsResult.status === 'fulfilled' && !alertsResult.value.error
      ? (alertsResult.value.data as any[])
      : [];

  const maintenanceRows =
    maintenanceResult.status === 'fulfilled' && !maintenanceResult.value.error
      ? (maintenanceResult.value.data as any[])
      : [];

  const fuelRows =
    fuelResult.status === 'fulfilled' && !fuelResult.value.error
      ? (fuelResult.value.data as any[])
      : [];

  const invoiceRows =
    invoicesResult.status === 'fulfilled' && !invoicesResult.value.error
      ? (invoicesResult.value.data as any[])
      : [];

  const documentRows =
    documentsResult.status === 'fulfilled' && !documentsResult.value.error
      ? (documentsResult.value.data as any[])
      : [];

  const documentsForProfile =
    documentsForProfileResult.status === 'fulfilled' &&
    !documentsForProfileResult.value.error
      ? (documentsForProfileResult.value.data as any[])
      : [];

  const suggestedTypes = new Set(['insurance', 'registration', 'receipt', 'warranty']);
  const documentTypesPresent = new Set(
    documentsForProfile.map((d: any) => d.type).filter(Boolean),
  );
  const documentProfileComplete = suggestedTypes.size === 0 || [...suggestedTypes].every((t) => documentTypesPresent.has(t));

  const openAlertsByVehicle = new Map<string, { title: string }>();
  for (const row of alertsRows as any[]) {
    if (row.status === 'resolved' || row.status === 'dismissed') continue;
    const vid = row.vehicle_id ?? '__account__';
    if (!openAlertsByVehicle.has(vid)) {
      openAlertsByVehicle.set(vid, { title: row.title });
    }
  }

  const vehicles: OverviewVehicle[] = vehiclesData.map((v) => {
    const nextAlert = openAlertsByVehicle.get(v.id) ?? openAlertsByVehicle.get('__account__');
    return {
      id: v.id as string,
      name: `${v.year ?? ''} ${v.make} ${v.model}`.trim(),
      healthScore: v.health_score != null ? Number(v.health_score) : null,
      currentMileage: v.current_mileage != null ? Number(v.current_mileage) : null,
      heroImageUrl: (v.hero_image_url as string) ?? null,
      nextServiceDue: nextAlert?.title ?? null,
    };
  });

  const alerts: UserAlert[] = alertsRows.map((row) => {
    const vehicleName =
      row.vehicles?.make && row.vehicles?.model
        ? `${row.vehicles.make} ${row.vehicles.model}`
        : 'All vehicles';

    const severity: UserAlert['severity'] =
      row.kind === 'maintenance_overdue' || row.kind === 'health_drop'
        ? 'critical'
        : row.kind === 'maintenance_due'
          ? 'warning'
          : 'info';

    const status: UserAlert['status'] =
      row.status === 'resolved' || row.status === 'dismissed' ? 'resolved' : 'open';

    return {
      id: row.id,
      title: row.title,
      description: row.message,
      vehicle: vehicleName,
      severity,
      status,
      meta: '',
    };
  });

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const upcomingMaintenance = alerts.filter((a) =>
    ['maintenance_due', 'maintenance_overdue', 'document_expiring'].includes(
      (a as any).kind ?? '',
    ),
  );

  const maintenanceCostTotal = maintenanceRows.reduce((sum, row) => {
    const cents = row.cost_cents ?? 0;
    return sum + (typeof cents === 'number' ? cents : Number(cents) || 0);
  }, 0);

  const fuelCostTotal = fuelRows.reduce((sum, row) => {
    const cents = row.total_cost_cents ?? 0;
    return sum + (typeof cents === 'number' ? cents : Number(cents) || 0);
  }, 0);

  const invoiceCostTotal = invoiceRows.reduce((sum, row) => {
    const cents = row.amount_cents ?? 0;
    return sum + (typeof cents === 'number' ? cents : Number(cents) || 0);
  }, 0);

  const monthlyCostTotal = maintenanceCostTotal + fuelCostTotal + invoiceCostTotal;

  const scoresWithValues = vehicles
    .map((v) => v.healthScore)
    .filter((s): s is number => s != null);
  const avgHealthScore =
    scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, s) => sum + s, 0) / scoresWithValues.length
      : null;

  const stats: OverviewStats = {
    vehicleCount: vehicles.length,
    openAlertCount: openAlerts.length,
    upcomingMaintenanceCount: upcomingMaintenance.length,
    monthlyCostTotal,
    avgHealthScore,
  };

  const activity: OverviewActivityItem[] = [];

  for (const row of maintenanceRows as any[]) {
    activity.push({
      id: String(row.id),
      kind: 'maintenance',
      title: row.type,
      description: row.vehicles?.make
        ? `${row.vehicles.make} ${row.vehicles.model}`
        : 'Service',
      date: row.service_date,
    });
  }

  for (const row of fuelRows as any[]) {
    activity.push({
      id: String(row.id),
      kind: 'fuel',
      title: 'Refuel',
      description: row.vehicles?.make
        ? `${row.vehicles.make} ${row.vehicles.model}`
        : 'Fuel log',
      date: row.fill_date,
    });
  }

  for (const row of documentRows as any[]) {
    activity.push({
      id: String(row.id),
      kind: 'document',
      title: 'Document Uploaded',
      description: row.name,
      date: row.created_at,
    });
  }

  for (const row of alertsRows as any[]) {
    activity.push({
      id: `alert-${row.id}`,
      kind: 'alert',
      title: row.title,
      description: row.message,
      date: row.created_at,
    });
  }

  activity.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const limitedActivity = activity.slice(0, 10);

  const expenseBuckets = new Map<string, number>();

  function addToBucket(dateStr: string | null | undefined, cents: number) {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return;
    const key = getMonthKey(d);
    expenseBuckets.set(key, (expenseBuckets.get(key) ?? 0) + cents / 100);
  }

  for (const row of maintenanceRows as any[]) {
    addToBucket(row.service_date, row.cost_cents ?? 0);
  }

  for (const row of fuelRows as any[]) {
    addToBucket(row.fill_date, row.total_cost_cents ?? 0);
  }

  for (const row of invoiceRows as any[]) {
    addToBucket(row.invoice_date, row.amount_cents ?? 0);
  }

  const expenseSeries: ExpensePoint[] = [];
  const months: string[] = [];
  const cursor = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    months.push(getMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const m of months) {
    expenseSeries.push({
      month: m,
      amount: expenseBuckets.get(m) ?? 0,
    });
  }

  const invoices: BillingInvoice[] = invoiceRows.map((row) => ({
    id: row.id,
    date: row.invoice_date,
    amount: formatCurrencyZAR(row.amount_cents ?? 0),
    status: row.status ?? 'paid',
  }));

  return {
    stats,
    vehicles,
    alerts: openAlerts,
    activity: limitedActivity,
    expenseSeries,
    invoices,
    documentProfileComplete,
  };
}

