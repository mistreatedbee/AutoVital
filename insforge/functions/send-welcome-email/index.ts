/**
 * Edge function: Send welcome email to users who recently completed onboarding.
 * Invoked by InsForge schedule (e.g. every 15 min).
 * Requires SENDGRID_API_KEY secret and INSFORGE_SERVICE_ROLE_KEY for DB access.
 *
 * Finds users where onboarding_progress.completed_at is set and profiles.welcome_email_sent_at is null.
 * Sends email via SendGrid, then sets welcome_email_sent_at.
 *
 * Deploy: insforge functions deploy send-welcome-email
 * Schedule: insforge schedules create --name "Welcome Emails" --cron "*/15 * * * *" \
 *   --url "https://YOUR_PROJECT.region.insforge.app/functions/send-welcome-email" --method POST
 */
import { createClient } from '@insforge/sdk';

const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

async function sendViaSendGrid(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  fromEmail: string = 'noreply@autovital.app',
  fromName: string = 'AutoVital',
): Promise<boolean> {
  const res = await fetch(SENDGRID_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return res.ok;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  const serviceKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '') || serviceKey;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'SENDGRID_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: missing Authorization or INSFORGE_SERVICE_ROLE_KEY' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_URL') ?? '',
      anonKey: Deno.env.get('INSFORGE_ANON_KEY') ?? '',
      accessToken: token,
    });

    // Find users who completed onboarding but haven't received welcome email
    const { data: progressRows, error: progressError } = await client.database
      .from('onboarding_progress')
      .select('user_id')
      .not('completed_at', 'is', null);

    if (progressError || !progressRows?.length) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: 'No completed onboarding found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userIds = progressRows.map((r: { user_id: string }) => r.user_id);

    const { data: profileRows, error: profileError } = await client.database
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds)
      .is('welcome_email_sent_at', null);

    if (profileError || !profileRows?.length) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: 'No pending welcome emails' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get emails from auth_users_view (id, email)
    const { data: userRows } = await client.database
      .from('auth_users_view')
      .select('id, email')
      .in('id', profileRows.map((p: { user_id: string }) => p.user_id));

    const emailById = new Map(
      (userRows ?? []).map((r: { id: string; email: string }) => [r.id, r.email]),
    );

    let sent = 0;
    for (const prof of profileRows) {
      const email = emailById.get(prof.user_id);
      if (!email) continue;

      const displayName = prof.display_name || 'there';
      const subject = 'Welcome to AutoVital!';
      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #0f172a;">Welcome to AutoVital, ${displayName}!</h1>
  <p style="color: #475569; line-height: 1.6;">Thanks for setting up your vehicle profile. You're all set to track maintenance, store documents, and never miss a service reminder.</p>
  <p style="color: #475569; line-height: 1.6;"><strong>Quick tips:</strong></p>
  <ul style="color: #475569; line-height: 1.8;">
    <li>Add your vehicles to get personalized health scores</li>
    <li>Upload insurance and registration for expiry alerts</li>
    <li>Log services to keep your history up to date</li>
  </ul>
  <p style="color: #475569; line-height: 1.6;">If you have questions, just reply to this email.</p>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">AutoVital – Vehicle care made simple</p>
</body>
</html>`;

      const success = await sendViaSendGrid(apiKey, email, subject, html);
      if (success) {
        await client.database
          .from('profiles')
          .update({
            welcome_email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', prof.user_id);
        sent++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, total: profileRows.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-welcome-email error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
