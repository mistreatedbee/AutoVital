import { getInsforgeClient } from '../lib/insforgeClient';
import type { AlertChannel, AlertKind } from '../domain/models';

export interface UserAlert {
  id: string | number;
  title: string;
  description: string;
  vehicle: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'resolved';
  meta: string;
}

export interface AlertPreference {
  id: string;
  userId: string;
  accountId: string;
  channel: AlertChannel;
  enabled: boolean;
  maintenanceLeadDays: number;
  maintenanceLeadDaysArray?: number[];
  documentExpiryLeadDays: number;
  reminderBasis?: string | null;
  weeklySummaryEmail?: boolean;
  quietHours: unknown | null;
}

export interface EmailTemplate {
  id: string | number;
  name: string;
  subject: string;
  status: 'active' | 'draft';
  lastEdited: string;
}

export interface InAppTemplate {
  id: string | number;
  name: string;
  message: string;
  type: 'Warning' | 'Alert';
}

export async function fetchUserAlerts(
  accountId: string | null,
): Promise<UserAlert[]> {
  if (!accountId) return [];

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alerts')
      .select('id, kind, status, title, message, vehicles(make, model)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load alerts from backend.', error);
      return [];
    }

    return (data as any[]).map((row) => {
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? `${row.vehicles.make} ${row.vehicles.model}`
          : 'All vehicles';

      const severity: UserAlert['severity'] =
        row.kind === 'maintenance_overdue' || row.kind === 'health_drop'
          ? 'critical'
          : row.kind === 'maintenance_due'
            ? 'warning'
            : 'info';

      const status: UserAlert['status'] =
        row.status === 'resolved' || row.status === 'dismissed' ? 'resolved' : 'open';

      return {
        id: row.id,
        title: row.title,
        description: row.message,
        vehicle: vehicleName,
        severity,
        status,
        meta: '',
      } as UserAlert;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Alerts service unavailable, using fallback alerts.', err);
    return [];
  }
}

export async function fetchAlertPreferences(
  userId: string | null,
  accountId: string | null,
): Promise<AlertPreference[] | null> {
  if (!userId || !accountId) {
    return null;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('account_id', accountId);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load alert preferences.', error);
      return null;
    }

    return (data as any[]).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      accountId: row.account_id as string,
      channel: row.channel as AlertChannel,
      enabled: Boolean(row.enabled),
      maintenanceLeadDays: row.maintenance_lead_days ?? 14,
      maintenanceLeadDaysArray: Array.isArray(row.maintenance_lead_days_array)
        ? row.maintenance_lead_days_array
        : [14, 7],
      documentExpiryLeadDays: row.document_expiry_lead_days ?? 30,
      reminderBasis: row.reminder_basis ?? null,
      weeklySummaryEmail: Boolean(row.weekly_summary_email),
      quietHours: row.quiet_hours ?? null,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Alert preferences service unavailable.', err);
    return null;
  }
}

export async function upsertAlertPreference(input: {
  userId: string;
  accountId: string;
  channel: AlertChannel;
  enabled: boolean;
  maintenanceLeadDays?: number;
  maintenanceLeadDaysArray?: number[];
  documentExpiryLeadDays?: number;
  reminderBasis?: string | null;
  weeklySummaryEmail?: boolean;
}): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const payload: Record<string, unknown> = {
      user_id: input.userId,
      account_id: input.accountId,
      channel: input.channel,
      enabled: input.enabled,
      maintenance_lead_days: input.maintenanceLeadDays ?? 14,
      document_expiry_lead_days: input.documentExpiryLeadDays ?? 30,
    };
    if (input.maintenanceLeadDaysArray !== undefined) {
      payload.maintenance_lead_days_array = input.maintenanceLeadDaysArray;
    }
    if (input.reminderBasis !== undefined) {
      payload.reminder_basis = input.reminderBasis;
    }
    if (input.weeklySummaryEmail !== undefined) {
      payload.weekly_summary_email = input.weeklySummaryEmail;
    }

    const { error } = await client.database
      .from('alert_preferences')
      .upsert(payload, {
        onConflict: 'user_id,account_id,channel',
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to upsert alert preference.', error);
      return false;
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Alert preference upsert failed.', err);
    return false;
  }
}

export interface DerivedAlert extends UserAlert {
  kind: AlertKind;
  source: 'derived';
}

export async function updateAlertStatus(
  alertId: string | number,
  status: 'resolved' | 'dismissed',
): Promise<void> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('alerts')
      .update({ status })
      .eq('id', alertId);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update alert status.', error);
      throw new Error('Could not update the alert.');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Alerts service unavailable, status not updated.', err);
    throw err instanceof Error ? err : new Error('Could not update the alert.');
  }
}

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alert_templates')
      .select('id, name, subject, status, updated_at')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load email templates from backend, using fallback.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      status: row.status ?? 'active',
      lastEdited: row.updated_at ?? '',
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Email templates service unavailable, using fallback.', err);
    return [];
  }
}

export async function fetchInAppTemplates(): Promise<InAppTemplate[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alert_in_app_templates')
      .select('id, name, message, type')
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load in-app templates from backend, using fallback.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      type: row.type ?? 'Warning',
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('In-app templates service unavailable, using fallback.', err);
    return [];
  }
}

export async function updateEmailTemplate(
  id: string | number,
  input: { name?: string; subject?: string; status?: string },
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('alert_templates')
      .update({
        ...(input.name != null && { name: input.name }),
        ...(input.subject != null && { subject: input.subject }),
        ...(input.status != null && { status: input.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update email template.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Update email template failed.', err);
    return false;
  }
}

export async function updateInAppTemplate(
  id: string | number,
  input: { name?: string; message?: string; type?: string },
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('alert_in_app_templates')
      .update({
        ...(input.name != null && { name: input.name }),
        ...(input.message != null && { message: input.message }),
        ...(input.type != null && { type: input.type }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update in-app template.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Update in-app template failed.', err);
    return false;
  }
}
