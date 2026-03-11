import { getInsforgeClient } from '../lib/insforgeClient';

export interface UserAlert {
  id: string | number;
  title: string;
  description: string;
  vehicle: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'resolved';
  meta: string;
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

const FALLBACK_USER_ALERTS: UserAlert[] = [
  {
    id: 1,
    title: 'Oil Change Overdue',
    description: 'Honda Civic • Was due at 68,000 miles (Currently 68,200)',
    vehicle: 'Honda Civic',
    severity: 'critical',
    status: 'open',
    meta: 'High Priority',
  },
  {
    id: 2,
    title: 'Tire Rotation Upcoming',
    description: 'Tesla Model 3 • Recommended every 6,000 miles',
    vehicle: 'Tesla Model 3',
    severity: 'warning',
    status: 'open',
    meta: 'In 500 miles',
  },
];

const FALLBACK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 1,
    name: 'Service Due Reminder',
    subject: 'Your {{vehicle_name}} needs service soon',
    status: 'active',
    lastEdited: '2 days ago',
  },
  {
    id: 2,
    name: 'Health Score Drop Alert',
    subject: 'Alert: {{vehicle_name}} health score decreased',
    status: 'active',
    lastEdited: '1 week ago',
  },
  {
    id: 3,
    name: 'Welcome Email',
    subject: 'Welcome to AutoVital!',
    status: 'active',
    lastEdited: '1 month ago',
  },
  {
    id: 4,
    name: 'Subscription Renewal',
    subject: 'Your AutoVital subscription is renewing',
    status: 'draft',
    lastEdited: '3 days ago',
  },
];

const FALLBACK_INAPP_TEMPLATES: InAppTemplate[] = [
  {
    id: 5,
    name: 'Upcoming Service',
    message: 'Service due for {{vehicle_name}} in {{days}} days.',
    type: 'Warning',
  },
  {
    id: 6,
    name: 'Document Expiring',
    message: 'Your {{doc_type}} is expiring soon.',
    type: 'Alert',
  },
];

export async function fetchUserAlerts(
  accountId: string | null,
): Promise<UserAlert[]> {
  if (!accountId) {
    return FALLBACK_USER_ALERTS;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alerts')
      .select('id, kind, status, title, message, vehicles(make, model)')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load alerts from backend, using fallback alerts.', error);
      return FALLBACK_USER_ALERTS;
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
    return FALLBACK_USER_ALERTS;
  }
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
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Alerts service unavailable, status not updated.', err);
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
      return FALLBACK_EMAIL_TEMPLATES;
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
    return FALLBACK_EMAIL_TEMPLATES;
  }
}

export async function fetchInAppTemplates(): Promise<InAppTemplate[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('alert_in_app_templates')
      .select('id, name, message, type')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load in-app templates from backend, using fallback.', error);
      return FALLBACK_INAPP_TEMPLATES;
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
    return FALLBACK_INAPP_TEMPLATES;
  }
}

