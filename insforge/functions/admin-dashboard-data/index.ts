/**
 * Admin edge function: Fetch dashboard metrics, revenue, signups, and platform health.
 * Requires platform admin (verified via platform_admins). Uses INSFORGE_SERVICE_ROLE_KEY
 * to call admin RPCs that may not be granted to authenticated role.
 *
 * GET - returns { metrics, revenue, signups, platformHealth }
 *
 * Deploy: insforge functions deploy admin-dashboard-data
 * Secret: insforge secrets add INSFORGE_SERVICE_ROLE_KEY <value>
 */
import { createClient } from '@insforge/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const serviceKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    return new Response(
      JSON.stringify({ error: 'INSFORGE_SERVICE_ROLE_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }

  const baseUrl = (Deno.env.get('INSFORGE_URL') ?? '').replace(/\/+$/, '');
  const anonKey = Deno.env.get('INSFORGE_ANON_KEY') ?? '';

  try {
    const userClient = createClient({
      baseUrl,
      anonKey,
      accessToken: authHeader.replace(/^Bearer\s+/i, ''),
    });

    const { data: session } = await userClient.auth.getCurrentSession();
    const userId = session?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const { data: adminRows } = await userClient.database
      .from('platform_admins')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!adminRows || (adminRows as unknown[]).length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: platform admin required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const adminClient = createClient({
      baseUrl,
      anonKey,
      accessToken: serviceKey,
    });

    const [metricsRes, revenueRes, signupsRes, healthRes] = await Promise.all([
      adminClient.database.rpc('admin_dashboard_metrics'),
      adminClient.database.rpc('admin_revenue_by_month', { p_months: 6 }),
      adminClient.database.rpc('admin_signups_by_day', { p_days: 7 }),
      adminClient.database.rpc('admin_platform_health'),
    ]);

    const metrics = metricsRes.error ? null : (metricsRes.data as Record<string, unknown>);
    const revenue = revenueRes.error ? [] : (revenueRes.data as { month_key: string; revenue_cents: number }[]);
    const signups = signupsRes.error ? [] : (signupsRes.data as { day_key: string; signup_count: number }[]);
    const platformHealth = healthRes.error ? null : (healthRes.data as Record<string, unknown>);

    return new Response(
      JSON.stringify({
        metrics,
        revenue: revenue ?? [],
        signups: signups ?? [],
        platformHealth: platformHealth ?? null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      },
    );
  } catch (err) {
    console.error('admin-dashboard-data error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
  }
}
