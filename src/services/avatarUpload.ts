import { getInsforgeClient } from '../lib/insforgeClient';
import { updateProfile } from './profile';

const rawAvatarsBucket = (import.meta.env.VITE_AVATARS_BUCKET as string | undefined)?.trim();
const AVATARS_BUCKET = rawAvatarsBucket && rawAvatarsBucket.length > 0 ? rawAvatarsBucket : 'avatars';

export async function uploadAvatarFile(
  userId: string,
  file: File,
): Promise<{ url: string }> {
  let client;
  try {
    client = getInsforgeClient();
  } catch (err) {
    throw new Error(
      'File uploads are currently unavailable because the backend is not configured. Please try again later.',
    );
  }

  const { data, error } = await client.storage.from(AVATARS_BUCKET).uploadAuto(file);

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upload avatar file.', error);
    throw new Error('Failed to upload profile picture. Please try again in a moment.');
  }

  const { url } = data as { url: string };
  const ok = await updateProfile(userId, { avatarUrl: url });
  if (!ok) {
    throw new Error('Failed to save profile picture. Please try again.');
  }

  return { url };
}
