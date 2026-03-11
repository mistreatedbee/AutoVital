/**
 * Admin edge function: Resend verification email for a user.
 * Requires admin authentication (enforced by caller/VITE_ADMIN_EMAILS).
 * Logs action to audit_logs.
 *
 * Request body: { email: string }
 *
 * Deploy: insforge functions deploy admin-resend-verification
 */
import { createClient } from '@insforge/sdk';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = body?.email?.trim();
  if (!email) {
    return new Response(JSON.stringify({ error: 'email is required' }), {
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

    const { error } = await client.auth.resendVerificationEmail({ email });
    if (error) {
      return new Response(
        JSON.stringify({ error: (error as { message?: string })?.message ?? 'Failed to resend' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Log to audit (if client has access)
    await client.database.from('audit_logs').insert([
      {
        action: 'admin_resend_verification',
        entity_type: 'user',
        entity_id: email,
        metadata: { email },
      },
    ]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('admin-resend-verification error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
