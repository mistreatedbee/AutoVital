import { getInsforgeClient } from '../lib/insforgeClient';
import { formatCurrencyZAR, formatDateShort } from '../lib/formatters';
import type { PlanTier } from '../domain/models';

export interface BillingPlanSummary {
  planCode: PlanTier;
  planName: string;
  priceMonthly: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete';
  nextBillingDate: string | null;
  vehicleLimit: number | null;
  vehicleCountUsed: number | null;
}

export interface BillingInvoice {
  id: string | number;
  date: string;
  amount: string;
  status: 'paid' | 'open' | 'void';
}

export interface BillingOverview {
  plan: BillingPlanSummary;
  invoices: BillingInvoice[];
  paymentMethodSummary: string;
}

function emptyBillingOverview(): BillingOverview {
  return {
    plan: {
      planCode: 'starter',
      planName: '—',
      priceMonthly: '—',
      status: 'incomplete',
      nextBillingDate: null,
      vehicleLimit: null,
      vehicleCountUsed: null,
    },
    invoices: [],
    paymentMethodSummary: '—',
  };
}

export async function fetchBillingOverview(
  accountId: string | null,
): Promise<BillingOverview> {
  if (!accountId) return emptyBillingOverview();

  try {
    const client = getInsforgeClient();

    // Attempt to load the current subscription and plan from the database.
    const { data: subscriptionData, error: subscriptionError } = await client.database
      .from('subscriptions')
      .select(
        'status, current_period_end, plans(code, name, price_monthly_cents, vehicle_limit)',
      )
      .eq('account_id', accountId)
      .maybeSingle();

    if (subscriptionError || !subscriptionData) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load subscription from backend.', subscriptionError);
      return emptyBillingOverview();
    }

    const planRow = subscriptionData.plans;
    const planCode = (planRow.code ?? 'pro') as PlanTier;
    const priceMonthlyCents = planRow.price_monthly_cents ?? 900;
    const priceMonthly = formatCurrencyZAR(priceMonthlyCents);

    // Optional: derive vehicle usage from vehicles table
    let vehicleCountUsed: number | null = null;
    try {
      const { count } = await client.database
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('account_id', accountId);
      vehicleCountUsed = typeof count === 'number' ? count : null;
    } catch {
      vehicleCountUsed = null;
    }

    const plan: BillingPlanSummary = {
      planCode,
      planName: planRow.name ?? 'Plan',
      priceMonthly,
      status: subscriptionData.status ?? 'active',
      nextBillingDate: subscriptionData.current_period_end ?? null,
      vehicleLimit: planRow.vehicle_limit ?? null,
      vehicleCountUsed,
    };

    // Try to fetch invoices from a hypothetical billing_invoices table.
    const { data: invoicesData, error: invoicesError } = await client.database
      .from('billing_invoices')
      .select('id, invoice_date, amount_cents, currency, status')
      .eq('account_id', accountId)
      .order('invoice_date', { ascending: false });

    let invoices: BillingInvoice[];
    if (!invoicesError && invoicesData) {
      invoices = (invoicesData as any[]).map((row) => ({
        id: row.id,
        date: formatDateShort(row.invoice_date),
        amount: formatCurrencyZAR(row.amount_cents ?? 0),
        status: row.status ?? 'paid',
      }));
    } else {
      invoices = [];
    }

    return {
      plan,
      invoices,
      paymentMethodSummary: '—',
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Billing service unavailable.', err);
    return emptyBillingOverview();
  }
}

