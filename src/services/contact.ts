import { getInsforgeClient } from '../lib/insforgeClient';

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(payload: ContactPayload): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.database.from('contact_messages').insert([
    {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
  ]);

  if (error) {
    throw new Error(error.message ?? 'Failed to submit message.');
  }

  // Notification is handled server-side (trigger / cron) if configured.
}

