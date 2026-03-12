import React, { useEffect, useMemo, useState } from 'react';
import { EditIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrencyZAR } from '../../lib/formatters';
import {
  fetchAdminPlans,
  type AdminPlanRow,
} from '../../services/adminPlans';
import { fetchAdminSubscriptions } from '../../services/adminPlans';

export function PricingManagement() {
  const [plans, setPlans] = useState<AdminPlanRow[]>([]);
  const [subscriptionCounts, setSubscriptionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [planRows, subRows] = await Promise.all([
          fetchAdminPlans(),
          fetchAdminSubscriptions(),
        ]);
        if (!cancelled) {
          setPlans(planRows);
          const counts: Record<string, number> = {};
          for (const s of subRows) {
            if (s.status === 'active' || s.status === 'trialing') {
              counts[s.planCode] = (counts[s.planCode] ?? 0) + 1;
            }
          }
          setSubscriptionCounts(counts);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceLabel = (cents: number) => formatCurrencyZAR(cents);

  const vehicleLimitLabel = (limit: number | null) =>
    limit == null ? 'Unlimited' : String(limit);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Pricing & Plans
          </h1>
          <p className="text-slate-500 mt-1">
            Manage subscription tiers and feature limits.
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-rose-600 hover:bg-rose-700 border-none"
        >
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="p-6 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {plan.name}
                  </h2>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">
                    {priceLabel(plan.priceMonthlyCents)}
                    <span className="text-base font-normal text-slate-500">
                      /mo
                    </span>
                  </div>
                </div>
                <Badge variant="accent">Active</Badge>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                <p className="text-sm text-slate-500">Active Subscribers</p>
                <p className="text-lg font-bold text-slate-900">
                  {(subscriptionCounts[plan.code] ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                  Features
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Vehicle limit</span>
                  <span className="font-medium text-slate-900">
                    {vehicleLimitLabel(plan.vehicleLimit)}
                  </span>
                </div>
                {Object.entries(plan.features).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{key}</span>
                    <span className="font-medium text-slate-900">
                      {typeof val === 'boolean'
                        ? val
                          ? 'Yes'
                          : 'No'
                        : String(val)}
                    </span>
                  </div>
                ))}
                {Object.keys(plan.features).length === 0 && (
                  <p className="text-sm text-slate-400 italic">
                    No custom features defined
                  </p>
                )}
              </div>

              <Button
                variant="secondary"
                className="w-full"
                icon={<EditIcon className="w-4 h-4" />}
              >
                Edit Plan
              </Button>
            </Card>
          ))}
        </div>
      )}

      {plans.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <p className="text-slate-500">No plans in database. Create one to get started.</p>
        </Card>
      )}

      <Card className="p-6 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Global Feature Toggles
        </h3>
        <p className="text-sm text-slate-500">
          Feature toggles can be configured here. (Future enhancement)
        </p>
      </Card>
    </div>
  );
}
