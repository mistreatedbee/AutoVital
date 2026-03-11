import { getInsforgeClient } from '../lib/insforgeClient';
import { updateProfile } from './profile';

const AVATARS_BUCKET =
  (import.meta.env.VITE_AVATARS_BUCKET as string | undefined) ?? 'avatars';

export async function uploadAvatarFile(
  userId: string,
  file: File,
): Promise<{ url: string } | null> {
  const client = getInsforgeClient();

  const { data, error } = await client.storage
    .from(AVATARS_BUCKET)
    .uploadAuto(file);

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upload avatar file.', error);
    return null;
  }

  const { url } = data;
  const ok = await updateProfile(userId, { avatarUrl: url });
  if (!ok) {
    return null;
  }
  return { url };
}
