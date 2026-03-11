/**
 * Admin edge function: Set account status for a user (active/suspended/pending).
 * Requires admin authentication (enforced by caller/VITE_ADMIN_EMAILS).
 * Logs action to audit_logs.
 *
 * Request body: { userId: string, status: 'active' | 'suspended' | 'pending' }
 *
 * Deploy: insforge functions deploy admin-set-account-status
 */
import { createClient } from '@insforge/sdk';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { userId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = body?.userId;
  const status = body?.status;
  if (!userId || !status) {
    return new Response(JSON.stringify({ error: 'userId and status are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!['active', 'suspended', 'pending'].includes(status)) {
    return new Response(JSON.stringify({ error: 'status must be active, suspended, or pending' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_URL') ?? '',
      anonKey: Deno.env.get('INSFORGE_ANON_KEY') ?? '',
      accessToken: authHeader.replace(/^Bearer\s+/i, ''),
    });

    const { error } = await client.database.rpc('admin_set_account_status', {
      p_user_id: userId,
      p_status: status,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: (error as { message?: string })?.message ?? 'Failed to set status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    await client.database.from('audit_logs').insert([
      {
        action: 'admin_set_account_status',
        entity_type: 'user',
        entity_id: userId,
        metadata: { status },
      },
    ]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('admin-set-account-status error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
