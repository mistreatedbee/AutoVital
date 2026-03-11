import { createClient } from '@insforge/sdk';

// Shared InsForge client for the frontend.
// Configure these in your Vite environment for local/dev/prod:
// VITE_INSFORGE_URL, VITE_INSFORGE_ANON_KEY

// Normalize baseUrl: remove trailing slash to avoid double-slash in API paths
const rawUrl = import.meta.env.VITE_INSFORGE_URL as string | undefined;
const baseUrl = rawUrl?.replace(/\/+$/, '') ?? undefined;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY as string | undefined;

if (!baseUrl || !anonKey) {
  fetch('http://127.0.0.1:7293/ingest/e3e34ecb-6f03-4ff2-80b8-7e6b2f049d58', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2511e9' },
    body: JSON.stringify({
      sessionId: '2511e9',
      location: 'insforgeClient.ts',
      message: 'InsForge client missing config',
      data: { hypothesisId: 'C', hasBaseUrl: !!baseUrl, hasAnonKey: !!anonKey },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
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

