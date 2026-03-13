import { getInsforgeClient } from '../lib/insforgeClient';
import type { Profile } from '../domain/models';

export interface ProfileUpdatePayload {
  displayName?: string | null;
  country?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  currency?: string | null;
  mileageUnit?: string | null;
  fuelUnit?: string | null;
  timezone?: string | null;
  locale?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  measurementSystem?: 'imperial' | 'metric';
}

export function deriveMeasurementSystemFromUnits(input: {
  measurementSystem?: 'imperial' | 'metric' | null;
  mileageUnit?: string | null;
  fuelUnit?: string | null;
}): 'imperial' | 'metric' {
  if (input.measurementSystem) {
    return input.measurementSystem;
  }
  if (input.mileageUnit === 'miles' || input.fuelUnit === 'gallons') {
    return 'imperial';
  }
  return 'metric';
}

export async function fetchCurrentProfile(userIdInput: string | { id?: string } | null | undefined): Promise<Profile | null> {
  const userId =
    typeof userIdInput === 'string'
      ? userIdInput
      : typeof userIdInput?.id === 'string'
        ? userIdInput.id
        : null;
  if (!userId) return null;

  const client = getInsforgeClient();

  const { data, error } = await client.database
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load profile for user.', error);
    return null;
  }

  return {
    userId: data.user_id,
    defaultAccountId: data.default_account_id,
    phoneNumber: data.phone_number,
    measurementSystem: data.measurement_system === 'metric' ? 'metric' : 'imperial',
    displayName: data.display_name ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    province: data.province ?? null,
    postalCode: data.postal_code ?? null,
    currency: data.currency ?? null,
    mileageUnit: data.mileage_unit ?? null,
    fuelUnit: data.fuel_unit ?? null,
    timezone: data.timezone ?? null,
    locale: data.locale ?? null,
    avatarUrl: data.avatar_url ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const measurementSystem = deriveMeasurementSystemFromUnits({
      measurementSystem: payload.measurementSystem,
      mileageUnit: payload.mileageUnit,
      fuelUnit: payload.fuelUnit,
    });
    const dbPayload: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
      measurement_system: measurementSystem,
    };
    if (payload.displayName !== undefined) dbPayload.display_name = payload.displayName;
    if (payload.country !== undefined) dbPayload.country = payload.country;
    if (payload.city !== undefined) dbPayload.city = payload.city;
    if (payload.province !== undefined) dbPayload.province = payload.province;
    if (payload.postalCode !== undefined) dbPayload.postal_code = payload.postalCode;
    if (payload.currency !== undefined) dbPayload.currency = payload.currency;
    if (payload.mileageUnit !== undefined) dbPayload.mileage_unit = payload.mileageUnit;
    if (payload.fuelUnit !== undefined) dbPayload.fuel_unit = payload.fuelUnit;
    if (payload.timezone !== undefined) dbPayload.timezone = payload.timezone;
    if (payload.locale !== undefined) dbPayload.locale = payload.locale;
    if (payload.avatarUrl !== undefined) dbPayload.avatar_url = payload.avatarUrl;
    if (payload.phoneNumber !== undefined) dbPayload.phone_number = payload.phoneNumber;

    const { error } = await client.database
      .from('profiles')
      .upsert(dbPayload, { onConflict: 'user_id' });

    return !error;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update profile.', err);
    return false;
  }
}

