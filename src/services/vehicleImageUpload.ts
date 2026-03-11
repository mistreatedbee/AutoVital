import { getInsforgeClient } from '../lib/insforgeClient';
import { createVehicleImage, setPrimaryVehicleImage } from './vehicleImages';

const VEHICLE_IMAGES_BUCKET =
  (import.meta.env.VITE_VEHICLE_IMAGES_BUCKET as string | undefined) ?? 'vehicle-images';

export async function uploadVehicleImageFile(params: {
  accountId: string;
  vehicleId: string;
  file: File;
}): Promise<{ url: string } | null> {
  const client = getInsforgeClient();

  const { data, error } = await client.storage.from(VEHICLE_IMAGES_BUCKET).uploadAuto(params.file);

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upload vehicle image file.', error);
    return null;
  }

  const { url, key } = data;

  const image = await createVehicleImage({
    accountId: params.accountId,
    vehicleId: params.vehicleId,
    url,
    storageBucket: VEHICLE_IMAGES_BUCKET,
    storageKey: key,
    provider: 'insforge',
  });

  if (!image) {
    return null;
  }

  await setPrimaryVehicleImage(params.accountId, params.vehicleId, image.id);

  return { url };
}

