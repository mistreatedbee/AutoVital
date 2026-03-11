/**
 * Edge function: Check for expiring documents and create alerts.
 * Invoked by InsForge schedule (e.g. daily).
 * Requires INSFORGE_SERVICE_ROLE_KEY or Bearer token in Authorization header
 * for admin access to query documents and insert alerts.
 *
 * Deploy: insforge functions deploy check-document-expiry
 * Schedule: insforge schedules create --name "Document Expiry Check" \
 *   --cron "0 9 * * *" --url "https://YOUR_PROJECT.region.insforge.app/functions/check-document-expiry" \
 *   --method POST --headers '{"Authorization": "Bearer ${{secrets.CRON_SECRET}}"}'
 */
import { createClient } from '@insforge/sdk';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  const serviceKey = Deno.env.get('INSFORGE_SERVICE_ROLE_KEY');
  const token = authHeader?.replace(/^Bearer\s+/i, '') || serviceKey;

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

    const now = new Date();
    const maxDays = 60;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + maxDays);

    // Documents with expires_at in the next 60 days, not deleted
    const { data: docs, error: docsError } = await client.database
      .from('documents')
      .select('id, account_id, vehicle_id, name, type, expires_at')
      .not('expires_at', 'is', null)
      .lte('expires_at', cutoff.toISOString())
      .gte('expires_at', now.toISOString())
      .is('deleted_at', null);

    if (docsError || !docs?.length) {
      return new Response(
        JSON.stringify({ ok: true, alertsCreated: 0, message: 'No expiring documents' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    let alertsCreated = 0;

    for (const doc of docs) {
      const expiresAt = new Date(doc.expires_at as string);

      // Get account members and their alert preferences
      const { data: members } = await client.database
        .from('account_members')
        .select('user_id')
        .eq('account_id', doc.account_id);

      if (!members?.length) continue;

      const userIds = [...new Set(members.map((m: { user_id: string }) => m.user_id))];

      for (const userId of userIds) {
        const { data: prefs } = await client.database
          .from('alert_preferences')
          .select('channel, enabled, document_expiry_lead_days')
          .eq('user_id', userId)
          .eq('account_id', doc.account_id);

        if (!prefs?.length) continue;

        for (const pref of prefs) {
          if (!pref.enabled) continue;
          const leadDays = pref.document_expiry_lead_days ?? 30;
          const alertThreshold = new Date(now);
          alertThreshold.setDate(alertThreshold.getDate() + leadDays);

          if (expiresAt > alertThreshold) continue;

          const docType = (doc.type as string) || 'document';
          const title = `${docType.charAt(0).toUpperCase() + docType.slice(1)} expiring soon`;
          const message = `Your ${docType} "${doc.name}" expires on ${expiresAt.toLocaleDateString()}.`;

          // Avoid duplicate alerts: skip if same alert exists in last 7 days
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const { data: existing } = await client.database
            .from('alerts')
            .select('id')
            .eq('account_id', doc.account_id)
            .eq('user_id', userId)
            .eq('kind', 'document_expiring')
            .eq('channel', pref.channel)
            .in('status', ['pending', 'sent'])
            .eq('title', title)
            .gte('created_at', sevenDaysAgo.toISOString())
            .limit(1);

          if (existing?.length) continue;

          const { error: insertError } = await client.database.from('alerts').insert([
            {
              account_id: doc.account_id,
              vehicle_id: doc.vehicle_id,
              user_id: userId,
              kind: 'document_expiring',
              channel: pref.channel as 'email' | 'in_app',
              status: 'pending',
              title,
              message,
            },
          ]);

          if (!insertError) alertsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, alertsCreated, documentsChecked: docs.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('check-document-expiry error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
