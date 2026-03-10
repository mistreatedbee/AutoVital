import React, { useEffect, useState } from 'react';
import { CreditCardIcon, CheckIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  fetchBillingOverview,
  type BillingOverview,
} from '../../services/billing';

export function BillingSubscription() {
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchBillingOverview()
      .then((overview) => {
        if (isMounted) {
          setBilling(overview);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const plan = billing?.plan;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your plan and payment methods.
        </p>
      </div>

      <Card className="p-8 border-2 border-primary-100 bg-primary-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900 font-heading">
                {plan?.planName ?? 'Pro Plan'}
              </h2>
              <Badge variant="primary">
                {plan?.status === 'trialing' ? 'Trialing' : 'Active'}
              </Badge>
            </div>
            <p className="text-slate-600 mb-4">
              {plan
                ? `${plan.priceMonthly} / month${
                  plan.nextBillingDate
                    ? ` • Next billing date: ${plan.nextBillingDate}`
                    : ''
                }`
                : '$9.00 / month • Next billing date: Nov 15, 2023'}
            </p>

            <div className="space-y-2 max-w-sm">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">
                  Vehicle Limit
                </span>
                <span className="text-slate-900 font-bold">
                  {plan?.vehicleCountUsed ?? 3}
                  {' '}
                  of
                  {' '}
                  {plan?.vehicleLimit ?? 5}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{
                    width:
                      plan && plan.vehicleLimit && plan.vehicleCountUsed != null
                        ? `${Math.min(
                          100,
                          (plan.vehicleCountUsed / plan.vehicleLimit) * 100,
                        ).toFixed(0)}%`
                        : '60%',
                  }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button variant="primary">Upgrade to Fleet</Button>
            <Button variant="secondary">Cancel Subscription</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 font-heading mb-6">
          Payment Method
        </h3>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center text-slate-500">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {billing?.paymentMethodSummary.split('•')[0] ?? 'Visa ending in 4242'}
              </p>
              <p className="text-sm text-slate-500">
                {billing?.paymentMethodSummary.split('•')[1] ?? 'Expires 12/2025'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            Update
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Billing History
          </h3>
        </div>
        {loading || !billing ? (
          <div className="p-6 text-slate-500">Loading billing history...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.invoices.map((invoice) =>
              <tr key={invoice.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                    variant="neutral"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200">

                      {invoice.status === 'paid' ? 'Paid' : invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="text-primary-600 hover:underline font-medium">
                      Download
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>);

}