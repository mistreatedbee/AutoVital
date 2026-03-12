import React, { useCallback, useEffect, useState } from 'react';
import { EditIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { formatCurrencyZAR } from '../../lib/formatters';
import {
  fetchAdminPlans,
  fetchAdminSubscriptions,
  createPlan,
  updatePlan,
  type AdminPlanRow,
} from '../../services/adminPlans';
import { useAuth } from '../../auth/AuthProvider';
import { auditPlanCreated, auditPlanUpdated } from '../../lib/auditEvents';

export function PricingManagement() {
  const { user } = useAuth();
  const actor = { userId: user?.id ?? null, email: user?.email ?? null };
  const [plans, setPlans] = useState<AdminPlanRow[]>([]);
  const [subscriptionCounts, setSubscriptionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [planModal, setPlanModal] = useState<{ mode: 'create' | 'edit'; plan?: AdminPlanRow } | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const [planRows, subRows] = await Promise.all([
        fetchAdminPlans(),
        fetchAdminSubscriptions(),
      ]);
      setPlans(planRows);
      const counts: Record<string, number> = {};
      for (const s of subRows) {
        if (s.status === 'active' || s.status === 'trialing') {
          counts[s.planCode] = (counts[s.planCode] ?? 0) + 1;
        }
      }
      setSubscriptionCounts(counts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

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
          onClick={() => setPlanModal({ mode: 'create' })}>
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
                onClick={() => setPlanModal({ mode: 'edit', plan })}>
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

      {planModal && (
        <PlanModal
          mode={planModal.mode}
          plan={planModal.plan}
          onClose={() => setPlanModal(null)}
          onSaved={() => {
            setPlanModal(null);
            void loadPlans();
          }}
          actor={actor}
        />
      )}
    </div>
  );
}

function PlanModal({
  mode,
  plan,
  onClose,
  onSaved,
  actor,
}: {
  mode: 'create' | 'edit';
  plan?: AdminPlanRow;
  onClose: () => void;
  onSaved: () => void;
  actor: { userId: string | null; email: string | null };
}) {
  const [code, setCode] = useState(plan?.code ?? '');
  const [name, setName] = useState(plan?.name ?? '');
  const [priceCents, setPriceCents] = useState(plan ? String(plan.priceMonthlyCents / 100) : '');
  const [vehicleLimit, setVehicleLimit] = useState(plan?.vehicleLimit != null ? String(plan.vehicleLimit) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cents = Math.round(parseFloat(priceCents || '0') * 100);
    if (cents < 0) {
      setError('Price must be non-negative');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (mode === 'create' && !code.trim()) {
      setError('Code is required');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const id = await createPlan({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          priceMonthlyCents: cents,
          vehicleLimit: vehicleLimit ? parseInt(vehicleLimit, 10) : null,
          features: {},
        });
        await auditPlanCreated(actor, id, { code: code.trim(), name: name.trim() });
      } else if (plan) {
        await updatePlan({
          id: plan.id,
          name: name.trim(),
          priceMonthlyCents: cents,
          vehicleLimit: vehicleLimit ? parseInt(vehicleLimit, 10) : null,
        });
        await auditPlanUpdated(actor, plan.id, { code: plan.code, name: name.trim() });
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {mode === 'create' ? 'Create Plan' : 'Edit Plan'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. starter"
            disabled={mode === 'edit'}
          />
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starter"
            required
          />
          <Input
            label="Price (ZAR per month)"
            type="number"
            step="0.01"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            placeholder="e.g. 99.00"
          />
          <Input
            label="Vehicle limit (empty = unlimited)"
            type="number"
            value={vehicleLimit}
            onChange={(e) => setVehicleLimit(e.target.value)}
            placeholder="e.g. 5"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
