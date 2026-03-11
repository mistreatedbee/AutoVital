import { getInsforgeClient } from './insforgeClient';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'garage';
}

/**
 * Bootstrap account, profile, and account_members for a newly signed-up user.
 * Idempotent: if profile already exists, returns without error.
 */
export async function bootstrapAccountAndProfile(
  userId: string,
  userName: string,
  phone?: string | null
): Promise<void> {
  const client = getInsforgeClient();

  // Check if profile already exists
  const { data: existingProfile } = await client.database
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingProfile) {
    return;
  }

  const accountName = userName?.trim() || 'My Garage';
  const slug = `${slugify(accountName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: accounts, error: accountError } = await client.database
    .from('accounts')
    .insert([
      {
        owner_user_id: userId,
        name: accountName,
        slug,
      },
    ])
    .select('id')
    .limit(1);

  if (accountError || !accounts?.[0]) {
    throw new Error(accountError?.message ?? 'Failed to create account');
  }

  const accountId = accounts[0].id as string;

  const { error: profileError } = await client.database.from('profiles').insert([
    {
      user_id: userId,
      default_account_id: accountId,
      phone_number: phone || null,
      measurement_system: 'imperial',
    },
  ]);

  if (profileError) {
    // Rollback: delete the account we just created (best effort)
    await client.database.from('accounts').delete().eq('id', accountId);
    throw new Error(profileError.message ?? 'Failed to create profile');
  }

  const { error: memberError } = await client.database.from('account_members').insert([
    {
      account_id: accountId,
      user_id: userId,
      role: 'owner',
    },
  ]);

  if (memberError) {
    // Profile and account exist; membership failed. Try to clean up profile.
    await client.database.from('profiles').delete().eq('user_id', userId);
    await client.database.from('accounts').delete().eq('id', accountId);
    throw new Error(memberError.message ?? 'Failed to add account membership');
  }
}
