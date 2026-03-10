import React from 'react';
import { ShieldAlertIcon, GlobeIcon, DatabaseIcon, KeyIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
export function AdminSettings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          Platform Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Configure global platform behavior and integrations.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <GlobeIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Platform Name" defaultValue="AutoVital" />
            <Input label="Support Email" defaultValue="support@autovital.com" />
          </div>
          <Input
            label="Company Address"
            defaultValue="100 Tech Parkway, San Francisco, CA 94105" />

          <Button
            variant="primary"
            className="bg-rose-600 hover:bg-rose-700 border-none">

            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <DatabaseIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Integrations</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div>
              <h4 className="font-bold text-slate-900">Stripe</h4>
              <p className="text-sm text-slate-500">
                Payment processing and subscriptions
              </p>
            </div>
            <Badge variant="accent">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div>
              <h4 className="font-bold text-slate-900">SendGrid</h4>
              <p className="text-sm text-slate-500">
                Transactional email delivery
              </p>
            </div>
            <Badge variant="accent">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div>
              <h4 className="font-bold text-slate-900">AWS S3</h4>
              <p className="text-sm text-slate-500">
                Document and image storage
              </p>
            </div>
            <Badge variant="accent">Connected</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-rose-200 bg-rose-50/30">
        <div className="flex items-center gap-3 mb-6 border-b border-rose-100 pb-4">
          <ShieldAlertIcon className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-rose-900">Danger Zone</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Maintenance Mode</h4>
              <p className="text-sm text-slate-500">
                Disable access for all non-admin users.
              </p>
            </div>
            <Button
              variant="secondary"
              className="text-rose-600 border-rose-200 hover:bg-rose-50">

              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-rose-100">
            <div>
              <h4 className="font-bold text-slate-900">Clear Cache</h4>
              <p className="text-sm text-slate-500">
                Force clear all application cache.
              </p>
            </div>
            <Button variant="secondary">Clear Cache</Button>
          </div>
        </div>
      </Card>
    </div>);

}