import { getInsforgeClient } from '../lib/insforgeClient';
import type { ServicePreferences } from '../domain/models';

export interface ServicePreferencesInput {
  vehicleId?: string | null;
  accountId: string;
  lastServiceDate?: string | null;
  lastServiceMileage?: number | null;
  serviceIntervalMonths?: number | null;
  serviceIntervalMileage?: number | null;
  lastOilChangeDate?: string | null;
  lastOilChangeMileage?: number | null;
  lastBrakeServiceDate?: string | null;
  lastBatteryDate?: string | null;
  lastTireRotationDate?: string | null;
  knownIssues?: string | null;
  workshopName?: string | null;
}

function rowToServicePreferences(row: Record<string, unknown>): ServicePreferences {
  return {
    id: row.id as string,
    vehicleId: (row.vehicle_id as string) ?? null,
    accountId: row.account_id as string,
    lastServiceDate: (row.last_service_date as string) ?? null,
    lastServiceMileage:
      row.last_service_mileage != null ? Number(row.last_service_mileage) : null,
    serviceIntervalMonths:
      row.service_interval_months != null ? Number(row.service_interval_months) : null,
    serviceIntervalMileage:
      row.service_interval_mileage != null ? Number(row.service_interval_mileage) : null,
    lastOilChangeDate: (row.last_oil_change_date as string) ?? null,
    lastOilChangeMileage:
      row.last_oil_change_mileage != null ? Number(row.last_oil_change_mileage) : null,
    lastBrakeServiceDate: (row.last_brake_service_date as string) ?? null,
    lastBatteryDate: (row.last_battery_date as string) ?? null,
    lastTireRotationDate: (row.last_tire_rotation_date as string) ?? null,
    knownIssues: (row.known_issues as string) ?? null,
    workshopName: (row.workshop_name as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchServicePreferences(
  accountId: string,
  vehicleId?: string | null,
): Promise<ServicePreferences | null> {
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('service_preferences')
      .select('*')
      .eq('account_id', accountId);

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    } else {
      query = query.is('vehicle_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }
    return rowToServicePreferences(data as Record<string, unknown>);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch service preferences.', err);
    return null;
  }
}

export async function upsertServicePreferences(
  input: ServicePreferencesInput,
): Promise<ServicePreferences | null> {
  try {
    const client = getInsforgeClient();
    const existing = await fetchServicePreferences(input.accountId, input.vehicleId ?? undefined);
    const payload: Record<string, unknown> = {
      vehicle_id: input.vehicleId ?? null,
      account_id: input.accountId,
      last_service_date: input.lastServiceDate ?? null,
      last_service_mileage: input.lastServiceMileage ?? null,
      service_interval_months: input.serviceIntervalMonths ?? null,
      service_interval_mileage: input.serviceIntervalMileage ?? null,
      last_oil_change_date: input.lastOilChangeDate ?? null,
      last_oil_change_mileage: input.lastOilChangeMileage ?? null,
      last_brake_service_date: input.lastBrakeServiceDate ?? null,
      last_battery_date: input.lastBatteryDate ?? null,
      last_tire_rotation_date: input.lastTireRotationDate ?? null,
      known_issues: input.knownIssues ?? null,
      workshop_name: input.workshopName ?? null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { data, error } = await client.database
        .from('service_preferences')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error || !data) {
        // eslint-disable-next-line no-console
        console.warn('Failed to update service preferences.', error);
        return null;
      }
      return rowToServicePreferences(data as Record<string, unknown>);
    }

    const { data, error } = await client.database
      .from('service_preferences')
      .insert([payload])
      .select()
      .single();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to insert service preferences.', error);
      return null;
    }
    return rowToServicePreferences(data as Record<string, unknown>);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upsert service preferences.', err);
    return null;
  }
}
