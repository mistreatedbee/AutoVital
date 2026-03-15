/**
 * Edge function: Ensure the authenticated user has an account (create if missing).
 * Uses INSFORGE_SERVICE_ROLE_KEY to bypass RLS so account creation works even when
 * client requests get 401/403.
 *
 * POST with Authorization: Bearer <user access token>
 * Returns: { ok: true, accountId: string } or { error: string }
 *
 * Deploy: insforge functions deploy ensure-account
 * Secret: insforge secrets add INSFORGE_SERVICE_ROLE_KEY <value>
 *        (Some projects use INSFORGE_SERVICE_KEY - add the same value to that secret if needed)
 */
import { createClient } from '@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'garage';
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const authHeader = req.headers.get('Authorization');
  const userToken = authHeader?.replace(/^Bearer\s+/i, '');
  if (!userToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Bearer token required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const serviceKey =
    Deno.env.get('INSFORGE_SERVICE_ROLE_KEY') ?? Deno.env.get('INSFORGE_SERVICE_KEY');
  const baseUrl = (Deno.env.get('INSFORGE_URL') ?? '').replace(/\/+$/, '');
  const anonKey = Deno.env.get('INSFORGE_ANON_KEY') ?? '';

  if (!serviceKey || !baseUrl || !anonKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration incomplete' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }

  try {
    const userClient = createClient({
      baseUrl,
      anonKey,
      accessToken: userToken,
    });

    const { data: sessionData } = await userClient.auth.getCurrentSession();
    const user = sessionData?.session?.user as { id: string; email?: string; name?: string } | undefined;
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const userId = user.id;
    const userName = user.name?.trim() || user.email?.trim() || 'User';

    const serviceClient = createClient({
      baseUrl,
      anonKey,
      accessToken: serviceKey,
    });

    const { data: profile } = await serviceClient.database
      .from('profiles')
      .select('user_id, default_account_id')
      .eq('user_id', userId)
      .maybeSingle();

    let accountId: string | null = null;

    if (!profile) {
      const accountName = userName || 'My Garage';
      const slug = `${slugify(accountName)}-${crypto.randomUUID().slice(0, 8)}`;

      const { data: accounts, error: accountError } = await serviceClient.database
        .from('accounts')
        .insert([{ owner_user_id: userId, name: accountName, slug }])
        .select('id')
        .limit(1);

      if (accountError || !accounts?.[0]) {
        throw new Error(accountError?.message ?? 'Failed to create account');
      }
      accountId = accounts[0].id as string;

      const { error: profileError } = await serviceClient.database.from('profiles').insert([
        {
          user_id: userId,
          default_account_id: accountId,
          measurement_system: 'metric',
          country: 'ZA',
          currency: 'ZAR',
          mileage_unit: 'km',
          fuel_unit: 'litres',
          timezone: 'Africa/Johannesburg',
          locale: 'en',
        },
      ]);

      if (profileError) {
        await serviceClient.database.from('accounts').delete().eq('id', accountId);
        throw new Error(profileError.message ?? 'Failed to create profile');
      }

      const { error: memberError } = await serviceClient.database.from('account_members').insert([
        { account_id: accountId, user_id: userId, role: 'owner' },
      ]);

      if (memberError) {
        await serviceClient.database.from('profiles').delete().eq('user_id', userId);
        await serviceClient.database.from('accounts').delete().eq('id', accountId);
        throw new Error(memberError.message ?? 'Failed to add membership');
      }
    } else if (profile.default_account_id) {
      accountId = profile.default_account_id as string;
    } else {
      const { data: owned } = await serviceClient.database
        .from('accounts')
        .select('id')
        .eq('owner_user_id', userId)
        .limit(1);

      if (owned?.[0]) {
        await serviceClient.database
          .from('profiles')
          .update({ default_account_id: owned[0].id })
          .eq('user_id', userId);
        accountId = owned[0].id as string;
      } else {
        const accountName = userName || 'My Garage';
        const slug = `${slugify(accountName)}-${crypto.randomUUID().slice(0, 8)}`;

        const { data: accounts, error: accountError } = await serviceClient.database
          .from('accounts')
          .insert([{ owner_user_id: userId, name: accountName, slug }])
          .select('id')
          .limit(1);

        if (accountError || !accounts?.[0]) {
          throw new Error(accountError?.message ?? 'Failed to create account');
        }
        accountId = accounts[0].id as string;

        const { error: profileUpdateError } = await serviceClient.database
          .from('profiles')
          .update({ default_account_id: accountId })
          .eq('user_id', userId);

        if (profileUpdateError) {
          await serviceClient.database.from('accounts').delete().eq('id', accountId);
          throw new Error(profileUpdateError.message ?? 'Failed to link profile');
        }

        const { error: memberError } = await serviceClient.database.from('account_members').insert([
          { account_id: accountId, user_id: userId, role: 'owner' },
        ]);

        if (memberError) {
          await serviceClient.database
            .from('profiles')
            .update({ default_account_id: null })
            .eq('user_id', userId);
          await serviceClient.database.from('accounts').delete().eq('id', accountId);
          throw new Error(memberError.message ?? 'Failed to add membership');
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, accountId: accountId ?? null }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  } catch (err) {
    const message = (err as Error).message ?? 'Internal error';
    console.error('ensure-account error:', err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }
}
