import { getInsforgeClient } from '../lib/insforgeClient';

export interface MonthlyCostPoint {
  month: string; // e.g. '2026-03'
  maintenanceCents: number;
  fuelCents: number;
  totalCents: number;
}

export interface VehicleCostBreakdown {
  vehicleId: string;
  vehicleName: string;
  maintenanceCents: number;
  fuelCents: number;
  totalCents: number;
  distanceKm: number | null;
  costPerKmCents: number | null;
}

function monthKey(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString.slice(0, 7);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

export async function fetchMonthlyCostTrends(
  accountId: string | null,
): Promise<MonthlyCostPoint[]> {
  if (!accountId) return [];

  const client = getInsforgeClient();

  try {
    const [maintenanceResult, fuelResult] = await Promise.all([
      client.database
        .from('maintenance_logs')
        .select('service_date, cost_cents')
        .eq('account_id', accountId),
      client.database
        .from('fuel_logs')
        .select('fill_date, total_cost_cents')
        .eq('account_id', accountId),
    ]);

    const maintenanceByMonth = new Map<string, number>();
    const fuelByMonth = new Map<string, number>();

    if (!maintenanceResult.error && maintenanceResult.data) {
      for (const row of maintenanceResult.data as any[]) {
        if (row.cost_cents == null || !row.service_date) continue;
        const key = monthKey(row.service_date);
        maintenanceByMonth.set(
          key,
          (maintenanceByMonth.get(key) ?? 0) + Number(row.cost_cents),
        );
      }
    }

    if (!fuelResult.error && fuelResult.data) {
      for (const row of fuelResult.data as any[]) {
        if (row.total_cost_cents == null || !row.fill_date) continue;
        const key = monthKey(row.fill_date);
        fuelByMonth.set(
          key,
          (fuelByMonth.get(key) ?? 0) + Number(row.total_cost_cents),
        );
      }
    }

    const allMonths = new Set<string>([
      ...maintenanceByMonth.keys(),
      ...fuelByMonth.keys(),
    ]);
    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map((m) => {
      const maintenanceCents = maintenanceByMonth.get(m) ?? 0;
      const fuelCents = fuelByMonth.get(m) ?? 0;
      return {
        month: m,
        maintenanceCents,
        fuelCents,
        totalCents: maintenanceCents + fuelCents,
      };
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to compute monthly cost trends.', err);
    return [];
  }
}

export async function fetchVehicleCostBreakdown(
  accountId: string | null,
): Promise<VehicleCostBreakdown[]> {
  if (!accountId) return [];

  const client = getInsforgeClient();

  try {
    const [vehiclesResult, maintenanceResult, fuelResult, mileageResult] =
      await Promise.all([
        client.database
          .from('vehicles')
          .select('id, make, model, nickname')
          .eq('account_id', accountId),
        client.database
          .from('maintenance_logs')
          .select('vehicle_id, cost_cents')
          .eq('account_id', accountId),
        client.database
          .from('fuel_logs')
          .select('vehicle_id, total_cost_cents')
          .eq('account_id', accountId),
        client.database
          .from('mileage_logs')
          .select('vehicle_id, odometer')
          .eq('account_id', accountId),
      ]);

    const vehicles = new Map<
      string,
      { name: string }
    >();
    if (!vehiclesResult.error && vehiclesResult.data) {
      for (const row of vehiclesResult.data as any[]) {
        const id = row.id as string;
        const name =
          row.nickname ||
          `${row.make ?? ''} ${row.model ?? ''}`.trim() ||
          'Vehicle';
        vehicles.set(id, { name });
      }
    }

    const maintenanceByVehicle = new Map<string, number>();
    if (!maintenanceResult.error && maintenanceResult.data) {
      for (const row of maintenanceResult.data as any[]) {
        if (!row.vehicle_id || row.cost_cents == null) continue;
        const vId = row.vehicle_id as string;
        maintenanceByVehicle.set(
          vId,
          (maintenanceByVehicle.get(vId) ?? 0) + Number(row.cost_cents),
        );
      }
    }

    const fuelByVehicle = new Map<string, number>();
    if (!fuelResult.error && fuelResult.data) {
      for (const row of fuelResult.data as any[]) {
        if (!row.vehicle_id || row.total_cost_cents == null) continue;
        const vId = row.vehicle_id as string;
        fuelByVehicle.set(
          vId,
          (fuelByVehicle.get(vId) ?? 0) + Number(row.total_cost_cents),
        );
      }
    }

    const distanceByVehicle = new Map<string, number>();
    if (!mileageResult.error && mileageResult.data) {
      const byVehicle: Record<string, number[]> = {};
      for (const row of mileageResult.data as any[]) {
        if (!row.vehicle_id || row.odometer == null) continue;
        const vId = row.vehicle_id as string;
        if (!byVehicle[vId]) byVehicle[vId] = [];
        byVehicle[vId].push(Number(row.odometer));
      }
      for (const [vId, readings] of Object.entries(byVehicle)) {
        if (!readings.length) continue;
        const min = Math.min(...readings);
        const max = Math.max(...readings);
        const dist = max - min;
        distanceByVehicle.set(vId, dist > 0 ? dist : 0);
      }
    }

    const allVehicleIds = new Set<string>([
      ...vehicles.keys(),
      ...maintenanceByVehicle.keys(),
      ...fuelByVehicle.keys(),
    ]);

    const result: VehicleCostBreakdown[] = [];
    for (const vId of allVehicleIds) {
      const info = vehicles.get(vId);
      const maintenanceCents = maintenanceByVehicle.get(vId) ?? 0;
      const fuelCents = fuelByVehicle.get(vId) ?? 0;
      const totalCents = maintenanceCents + fuelCents;
      const distanceKm = distanceByVehicle.get(vId) ?? null;
      const costPerKmCents =
        distanceKm && distanceKm > 0 ? Math.round(totalCents / distanceKm) : null;

      result.push({
        vehicleId: vId,
        vehicleName: info?.name ?? 'Vehicle',
        maintenanceCents,
        fuelCents,
        totalCents,
        distanceKm,
        costPerKmCents,
      });
    }

    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to compute per-vehicle breakdown.', err);
    return [];
  }
}

export function exportMonthlyCostTrendsToCsv(points: MonthlyCostPoint[]): Blob {
  const header = 'month,maintenance,fuel,total\n';
  const rows = points
    .map((p) => {
      const maintenance = (p.maintenanceCents / 100).toFixed(2);
      const fuel = (p.fuelCents / 100).toFixed(2);
      const total = (p.totalCents / 100).toFixed(2);
      return `${p.month},${maintenance},${fuel},${total}`;
    })
    .join('\n');
  const csv = header + rows;
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function exportVehicleBreakdownToCsv(
  rows: VehicleCostBreakdown[],
): Blob {
  const header =
    'vehicle,maintenance,fuel,total,distance_km,cost_per_km\n';
  const body = rows
    .map((r) => {
      const maintenance = (r.maintenanceCents / 100).toFixed(2);
      const fuel = (r.fuelCents / 100).toFixed(2);
      const total = (r.totalCents / 100).toFixed(2);
      const distance =
        r.distanceKm != null ? r.distanceKm.toFixed(1) : '';
      const costPerKm =
        r.costPerKmCents != null
          ? (r.costPerKmCents / 100).toFixed(2)
          : '';
      return `${JSON.stringify(r.vehicleName)},${maintenance},${fuel},${total},${distance},${costPerKm}`;
    })
    .join('\n');
  const csv = header + body;
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

