import React from 'react';
import { CreditCardIcon, CheckIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useBillingOverview } from '../../hooks/queries';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';

export function BillingSubscription() {
  const { accountId, loading: accountLoading } = useAccount();
  const { data: billing, isLoading: loading, isError, error: queryError, refetch } =
    useBillingOverview(accountId);

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

      {isError && !accountLoading && !loading && (
        <ErrorState
          title="Billing information failed to load"
          description={queryError instanceof Error ? queryError.message : 'We could not load your billing information right now. Please try again.'}
          onRetry={() => refetch()}
          className="max-w-3xl"
        />
      )}

      <Card className="p-8 border-2 border-primary-100 bg-primary-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900 font-heading">
                {plan?.planName ?? 'No active plan'}
              </h2>
              <Badge variant="primary">
                {plan?.status === 'trialing' ? 'Trialing' : plan ? 'Active' : '—'}
              </Badge>
            </div>
            <p className="text-slate-600 mb-4">
              {plan
                ? `${plan.priceMonthly} / month${
                  plan.nextBillingDate
                    ? ` • Next billing date: ${plan.nextBillingDate}`
                    : ''
                }`
                : 'No active subscription. Choose a plan to get started.'}
            </p>

            <div className="space-y-2 max-w-sm">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">
                  Vehicle Limit
                </span>
                <span className="text-slate-900 font-bold">
                  {plan?.vehicleCountUsed ?? 0}
                  {' '}
                  of
                  {' '}
                  {plan?.vehicleLimit ?? '—'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{
                    width:
                      plan && plan.vehicleLimit && plan.vehicleLimit > 0 && plan.vehicleCountUsed != null
                        ? `${Math.min(
                          100,
                          (plan.vehicleCountUsed / plan.vehicleLimit) * 100,
                        ).toFixed(0)}%`
                        : '0%',
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
                {billing?.paymentMethodSummary && billing.paymentMethodSummary !== '—'
                  ? (billing.paymentMethodSummary.split('•')[0] ?? 'No payment method on file')
                  : 'No payment method on file'}
              </p>
              <p className="text-sm text-slate-500">
                {billing?.paymentMethodSummary && billing.paymentMethodSummary !== '—'
                  ? (billing.paymentMethodSummary.split('•')[1] ?? '')
                  : 'Add a payment method to manage your subscription'}
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
        {accountLoading || loading || !billing ? (
          <div className="p-6">
            <LoadingState label="Loading billing history..." />
          </div>
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
              {billing.invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <EmptyState
                      title="No billing history yet"
                      description="Invoices will appear here once you have an active subscription."
                    />
                  </td>
                </tr>
              ) : billing.invoices.map((invoice) =>
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