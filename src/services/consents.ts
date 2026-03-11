import { getInsforgeClient } from '../lib/insforgeClient';

export interface ConsentRecord {
  consent_type: 'terms' | 'privacy' | 'marketing';
  granted: boolean;
  created_at: string;
}

/**
 * Record consent entries on signup. Inserts terms, privacy, and marketing consents.
 * Called after bootstrap when a new user is created.
 */
export async function recordConsents(
  userId: string,
  options: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
    userAgent?: string | null;
  }
): Promise<void> {
  const client = getInsforgeClient();
  const userAgent = options.userAgent ?? null;

  const rows = [
    { user_id: userId, consent_type: 'terms', granted: options.terms, user_agent: userAgent },
    { user_id: userId, consent_type: 'privacy', granted: options.privacy, user_agent: userAgent },
    { user_id: userId, consent_type: 'marketing', granted: options.marketing, user_agent: userAgent },
  ];

  const { error } = await client.database.from('consents').insert(rows);

  if (error) {
    throw new Error(error.message ?? 'Failed to record consents');
  }
}

/**
 * Fetch the latest consent records per type for the current user.
 */
export async function getUserConsents(): Promise<ConsentRecord[]> {
  const client = getInsforgeClient();
  const { data: session } = await client.auth.getCurrentSession();
  const userId = session?.session?.user?.id;
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await client.database
    .from('consents')
    .select('consent_type, granted, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message ?? 'Failed to fetch consents');
  }

  // Deduplicate by consent_type (keep latest)
  const seen = new Set<string>();
  const unique: ConsentRecord[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.consent_type as string)) {
      seen.add(row.consent_type as string);
      unique.push({
        consent_type: row.consent_type as ConsentRecord['consent_type'],
        granted: row.granted as boolean,
        created_at: row.created_at as string,
      });
    }
  }
  return unique;
}

/**
 * Update marketing consent (insert new row for audit trail).
 */
export async function updateMarketingConsent(
  granted: boolean,
  userAgent?: string | null
): Promise<void> {
  const client = getInsforgeClient();
  const { data: session } = await client.auth.getCurrentSession();
  const userId = session?.session?.user?.id;
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const { error } = await client.database.from('consents').insert([
    {
      user_id: userId,
      consent_type: 'marketing',
      granted,
      user_agent: userAgent ?? null,
    },
  ]);

  if (error) {
    throw new Error(error.message ?? 'Failed to update marketing consent');
  }
}
