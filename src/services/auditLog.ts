import { getInsforgeClient } from '../lib/insforgeClient';

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
}

export interface AuditLogFilters {
  from?: string;
  to?: string;
  actorEmail?: string;
  action?: string;
  entityType?: string;
}

export async function createAuditLogEntry(params: {
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database.from('audit_logs').insert([
      {
        actor_user_id: params.actorUserId,
        actor_email: params.actorEmail,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        metadata: params.metadata ?? {},
      },
    ]);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create audit log entry.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Audit log service failed.', err);
    return false;
  }
}

export async function fetchAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogEntry[]> {
  try {
    const client = getInsforgeClient();
    let query = client.database
      .from('audit_logs')
      .select('id, created_at, actor_user_id, actor_email, action, entity_type, entity_id, metadata')
      .order('created_at', { ascending: false });

    if (filters.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters.to) {
      query = query.lte('created_at', filters.to);
    }
    if (filters.actorEmail?.trim()) {
      query = query.ilike('actor_email', `%${filters.actorEmail.trim()}%`);
    }
    if (filters.action?.trim()) {
      query = query.eq('action', filters.action.trim());
    }
    if (filters.entityType?.trim()) {
      query = query.eq('entity_type', filters.entityType.trim());
    }

    const { data, error } = await query.limit(200);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load audit logs.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      actorUserId: row.actor_user_id ?? null,
      actorEmail: row.actor_email ?? null,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id ?? null,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Audit log fetch failed.', err);
    return [];
  }
}
