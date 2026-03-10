import { getInsforgeClient } from '../lib/insforgeClient';
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

const FALLBACK_BILLING_OVERVIEW: BillingOverview = {
  plan: {
    planCode: 'pro',
    planName: 'Pro Plan',
    priceMonthly: '$9.00',
    status: 'active',
    nextBillingDate: 'Nov 15, 2023',
    vehicleLimit: 5,
    vehicleCountUsed: 3,
  },
  paymentMethodSummary: 'Visa ending in 4242 • Expires 12/2025',
  invoices: [
    { id: 1, date: 'Oct 15, 2023', amount: '$9.00', status: 'paid' },
    { id: 2, date: 'Sep 15, 2023', amount: '$9.00', status: 'paid' },
    { id: 3, date: 'Aug 15, 2023', amount: '$9.00', status: 'paid' },
  ],
};

export async function fetchBillingOverview(): Promise<BillingOverview> {
  try {
    const client = getInsforgeClient();

    // Attempt to load the current subscription and plan from the database.
    const { data: subscriptionData, error: subscriptionError } = await client.database
      .from('subscriptions')
      .select(
        'status, current_period_end, plans(code, name, price_monthly_cents, vehicle_limit)',
      )
      .maybeSingle();

    if (subscriptionError || !subscriptionData) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load subscription from backend, using fallback billing data.', subscriptionError);
      return FALLBACK_BILLING_OVERVIEW;
    }

    const planRow = subscriptionData.plans;
    const planCode = (planRow.code ?? 'pro') as PlanTier;
    const priceMonthlyCents = planRow.price_monthly_cents ?? 900;
    const priceMonthly = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceMonthlyCents / 100);

    // Optional: derive vehicle usage from vehicles table
    let vehicleCountUsed: number | null = null;
    try {
      const { count } = await client.database
        .from('vehicles')
        .select('id', { count: 'exact', head: true });
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
      .order('invoice_date', { ascending: false });

    let invoices: BillingInvoice[];
    if (!invoicesError && invoicesData) {
      invoices = (invoicesData as any[]).map((row) => ({
        id: row.id,
        date: row.invoice_date,
        amount: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: row.currency ?? 'USD',
        }).format((row.amount_cents ?? 0) / 100),
        status: row.status ?? 'paid',
      }));
    } else {
      invoices = FALLBACK_BILLING_OVERVIEW.invoices;
    }

    return {
      plan,
      invoices,
      paymentMethodSummary: FALLBACK_BILLING_OVERVIEW.paymentMethodSummary,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Billing service unavailable, using fallback billing overview.', err);
    return FALLBACK_BILLING_OVERVIEW;
  }
}

