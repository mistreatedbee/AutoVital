import { createClient } from '@insforge/sdk';

// Shared InsForge client for the frontend.
// Configure these in your Vite environment for local/dev/prod:
// VITE_INSFORGE_URL, VITE_INSFORGE_ANON_KEY

// Normalize baseUrl: remove trailing slash to avoid double-slash in API paths
const rawUrl = import.meta.env.VITE_INSFORGE_URL as string | undefined;
const baseUrl = rawUrl?.replace(/\/+$/, '') ?? undefined;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined;

if (!baseUrl || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[InsForge] VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY are not set; backend calls will fail until configured.',
  );
}

const client =
  baseUrl && anonKey
    ? createClient({
      baseUrl,
      anonKey,
    })
    : null;

export function getInsforgeClient() {
  if (!client) {
    throw new Error(
      'InsForge client is not configured. Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your environment.',
    );
  }

  return client;
}

