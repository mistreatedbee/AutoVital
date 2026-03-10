import React from 'react';
import { EditIcon, CheckIcon, XIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
export function PricingManagement() {
  const plans = [
  {
    name: 'Starter',
    price: '$0',
    status: 'Active',
    users: '2,340',
    features: [
    {
      name: 'Vehicle Profiles',
      value: '1'
    },
    {
      name: 'Maintenance Log',
      value: 'Basic'
    },
    {
      name: 'Document Storage',
      value: '100MB'
    },
    {
      name: 'Smart Reminders',
      value: false
    }]

  },
  {
    name: 'Pro',
    price: '$9/mo',
    status: 'Active',
    users: '6,520',
    popular: true,
    features: [
    {
      name: 'Vehicle Profiles',
      value: 'Up to 5'
    },
    {
      name: 'Maintenance Log',
      value: 'Advanced'
    },
    {
      name: 'Document Storage',
      value: '10GB'
    },
    {
      name: 'Smart Reminders',
      value: true
    }]

  },
  {
    name: 'Fleet',
    price: '$39/mo',
    status: 'Active',
    users: '1,572',
    features: [
    {
      name: 'Vehicle Profiles',
      value: 'Unlimited'
    },
    {
      name: 'Maintenance Log',
      value: 'Enterprise'
    },
    {
      name: 'Document Storage',
      value: 'Unlimited'
    },
    {
      name: 'Smart Reminders',
      value: true
    }]

  }];

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
          className="bg-rose-600 hover:bg-rose-700 border-none">

          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) =>
        <Card
          key={plan.name}
          className={`p-6 relative ${plan.popular ? 'border-2 border-rose-500 shadow-lg' : ''}`}>

            {plan.popular &&
          <Badge
            variant="primary"
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white border-rose-600">

                Most Popular
              </Badge>
          }
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h2>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">
                  {plan.price}
                </div>
              </div>
              <Badge variant="accent">{plan.status}</Badge>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
              <p className="text-sm text-slate-500">Active Subscribers</p>
              <p className="text-lg font-bold text-slate-900">{plan.users}</p>
            </div>

            <div className="space-y-3 mb-8">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Features
              </h4>
              {plan.features.map((feat, i) =>
            <div
              key={i}
              className="flex items-center justify-between text-sm">

                  <span className="text-slate-600">{feat.name}</span>
                  {typeof feat.value === 'boolean' ?
              feat.value ?
              <CheckIcon className="w-4 h-4 text-emerald-500" /> :

              <XIcon className="w-4 h-4 text-slate-300" /> :


              <span className="font-medium text-slate-900">
                      {feat.value}
                    </span>
              }
                </div>
            )}
            </div>

            <Button
            variant="secondary"
            className="w-full"
            icon={<EditIcon className="w-4 h-4" />}>

              Edit Plan
            </Button>
          </Card>
        )}
      </div>

      <Card className="p-6 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Global Feature Toggles
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">
                OBD2 Scanner Integration (Beta)
              </h4>
              <p className="text-sm text-slate-500">
                Allow users to connect physical scanners.
              </p>
            </div>
            <div className="w-12 h-6 bg-rose-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">
                AI Repair Estimates
              </h4>
              <p className="text-sm text-slate-500">
                Use AI to estimate repair costs based on symptoms.
              </p>
            </div>
            <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>);

}