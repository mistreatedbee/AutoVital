import { getInsforgeClient } from '../lib/insforgeClient';

export interface AdminPlanRow {
  id: string;
  code: string;
  name: string;
  priceMonthlyCents: number;
  vehicleLimit: number | null;
  features: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSubscriptionRow {
  id: string;
  accountId: string;
  accountName: string;
  planId: string;
  planCode: string;
  planName: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  externalCustomerId: string | null;
  externalSubscriptionId: string | null;
  createdAt: string;
}

export interface PublicPlanRow {
  id: string;
  code: string;
  name: string;
  priceMonthlyCents: number;
  vehicleLimit: number | null;
  features: Record<string, unknown>;
}

export async function fetchPublicPlans(): Promise<PublicPlanRow[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('plans')
      .select('id, code, name, price_monthly_cents, vehicle_limit, features')
      .order('price_monthly_cents', { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      priceMonthlyCents: row.price_monthly_cents ?? 0,
      vehicleLimit: row.vehicle_limit ?? null,
      features: (row.features ?? {}) as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}

export async function fetchAdminPlans(): Promise<AdminPlanRow[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('plans')
      .select('id, code, name, price_monthly_cents, vehicle_limit, features, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin plans.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      priceMonthlyCents: row.price_monthly_cents ?? 0,
      vehicleLimit: row.vehicle_limit ?? null,
      features: (row.features ?? {}) as Record<string, unknown>,
      createdAt: row.created_at,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin plans service failed.', err);
    return [];
  }
}

export async function fetchAdminSubscriptions(): Promise<AdminSubscriptionRow[]> {
  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('subscriptions')
      .select(
        'id, account_id, plan_id, status, current_period_end, cancel_at_period_end, external_customer_id, external_subscription_id, created_at, accounts(name), plans(code, name)',
      )
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load admin subscriptions.', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      accountId: row.account_id,
      accountName: row.accounts?.name ?? 'Account',
      planId: row.plan_id,
      planCode: row.plans?.code ?? '',
      planName: row.plans?.name ?? 'Plan',
      status: row.status,
      currentPeriodEnd: row.current_period_end ?? null,
      cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
      externalCustomerId: row.external_customer_id ?? null,
      externalSubscriptionId: row.external_subscription_id ?? null,
      createdAt: row.created_at,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Admin subscriptions service failed.', err);
    return [];
  }
}

export interface CreatePlanInput {
  code: string;
  name: string;
  priceMonthlyCents: number;
  vehicleLimit?: number | null;
  features?: Record<string, unknown>;
}

export async function createPlan(input: CreatePlanInput): Promise<string> {
  const client = getInsforgeClient();
  const { data, error } = await client.database.rpc('admin_create_plan', {
    p_code: input.code,
    p_name: input.name,
    p_price_monthly_cents: input.priceMonthlyCents,
    p_vehicle_limit: input.vehicleLimit ?? null,
    p_features: input.features ?? {},
  });

  if (error) {
    throw new Error(error.message ?? 'Failed to create plan');
  }

  return data as string;
}

export interface UpdatePlanInput {
  id: string;
  name?: string;
  priceMonthlyCents?: number;
  vehicleLimit?: number | null;
  features?: Record<string, unknown>;
}

export async function updatePlan(input: UpdatePlanInput): Promise<void> {
  const client = getInsforgeClient();
  const { error } = await client.database.rpc('admin_update_plan', {
    p_id: input.id,
    p_name: input.name ?? null,
    p_price_monthly_cents: input.priceMonthlyCents ?? null,
    p_vehicle_limit: input.vehicleLimit ?? null,
    p_features: input.features ?? null,
  });

  if (error) {
    throw new Error(error.message ?? 'Failed to update plan');
  }
}
