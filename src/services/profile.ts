import { getInsforgeClient } from '../lib/insforgeClient';
import type { Profile } from '../domain/models';

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
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

