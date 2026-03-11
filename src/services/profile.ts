import { getInsforgeClient } from '../lib/insforgeClient';
import type { Profile } from '../domain/models';

export interface ProfileUpdatePayload {
  displayName?: string | null;
  country?: string | null;
  city?: string | null;
  currency?: string | null;
  mileageUnit?: string | null;
  fuelUnit?: string | null;
  timezone?: string | null;
  locale?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  measurementSystem?: 'imperial' | 'metric';
}

export async function fetchCurrentProfile(userId: string): Promise<Profile | null> {
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
    const dbPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.displayName !== undefined) dbPayload.display_name = payload.displayName;
    if (payload.country !== undefined) dbPayload.country = payload.country;
    if (payload.city !== undefined) dbPayload.city = payload.city;
    if (payload.currency !== undefined) dbPayload.currency = payload.currency;
    if (payload.mileageUnit !== undefined) dbPayload.mileage_unit = payload.mileageUnit;
    if (payload.fuelUnit !== undefined) dbPayload.fuel_unit = payload.fuelUnit;
    if (payload.timezone !== undefined) dbPayload.timezone = payload.timezone;
    if (payload.locale !== undefined) dbPayload.locale = payload.locale;
    if (payload.avatarUrl !== undefined) dbPayload.avatar_url = payload.avatarUrl;
    if (payload.phoneNumber !== undefined) dbPayload.phone_number = payload.phoneNumber;
    if (payload.measurementSystem !== undefined)
      dbPayload.measurement_system = payload.measurementSystem;

    const { error } = await client.database
      .from('profiles')
      .update(dbPayload)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update profile.', err);
    return false;
  }
}

