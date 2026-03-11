import { getInsforgeClient } from '../lib/insforgeClient';
import type { VehicleImage } from '../domain/models';

export interface CreateVehicleImageInput {
  accountId: string;
  vehicleId: string;
  url: string;
  storageBucket?: string | null;
  storageKey?: string | null;
  provider?: string | null;
  isPrimary?: boolean;
}

export async function createVehicleImage(
  input: CreateVehicleImageInput,
): Promise<VehicleImage | null> {
  const client = getInsforgeClient();

  const payload = {
    account_id: input.accountId,
    vehicle_id: input.vehicleId,
    url: input.url,
    storage_bucket: input.storageBucket ?? null,
    storage_key: input.storageKey ?? null,
    provider: input.provider ?? null,
    is_primary: input.isPrimary ?? false,
  };

  const { data, error } = await client.database
    .from('vehicle_images')
    .insert([payload])
    .select('*')
    .limit(1);

  if (error || !data || !data[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create vehicle image.', error);
    return null;
  }

  const row = data[0] as any;

  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    accountId: row.account_id,
    url: row.url,
    storageBucket: row.storage_bucket ?? null,
    storageKey: row.storage_key ?? null,
    provider: row.provider ?? null,
    isPrimary: row.is_primary ?? false,
    createdAt: row.created_at,
  };
}

export async function setPrimaryVehicleImage(
  accountId: string,
  vehicleId: string,
  imageId: string,
): Promise<void> {
  const client = getInsforgeClient();

  // Clear existing primary
  await client.database
    .from('vehicle_images')
    .update({ is_primary: false })
    .eq('account_id', accountId)
    .eq('vehicle_id', vehicleId);

  // Set new primary
  await client.database
    .from('vehicle_images')
    .update({ is_primary: true })
    .eq('account_id', accountId)
    .eq('vehicle_id', vehicleId)
    .eq('id', imageId);
}

export async function deleteVehicleImage(
  accountId: string,
  vehicleId: string,
  imageId: string,
): Promise<boolean> {
  const client = getInsforgeClient();

  const { error } = await client.database
    .from('vehicle_images')
    .delete()
    .eq('account_id', accountId)
    .eq('vehicle_id', vehicleId)
    .eq('id', imageId);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to delete vehicle image.', error);
    return false;
  }

  return true;
}

