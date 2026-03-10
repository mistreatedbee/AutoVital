import React, { useState } from 'react';
import { MailIcon, BellIcon, AlertTriangleIcon, EditIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
export function AlertsControl() {
  const [activeTab, setActiveTab] = useState('email');
  const templates = {
    email: [
    {
      id: 1,
      name: 'Service Due Reminder',
      subject: 'Your {{vehicle_name}} needs service soon',
      status: 'Active',
      lastEdited: '2 days ago'
    },
    {
      id: 2,
      name: 'Health Score Drop Alert',
      subject: 'Alert: {{vehicle_name}} health score decreased',
      status: 'Active',
      lastEdited: '1 week ago'
    },
    {
      id: 3,
      name: 'Welcome Email',
      subject: 'Welcome to AutoVital!',
      status: 'Active',
      lastEdited: '1 month ago'
    },
    {
      id: 4,
      name: 'Subscription Renewal',
      subject: 'Your AutoVital subscription is renewing',
      status: 'Draft',
      lastEdited: '3 days ago'
    }],

    inapp: [
    {
      id: 5,
      name: 'Upcoming Service',
      message: 'Service due for {{vehicle_name}} in {{days}} days.',
      type: 'Warning'
    },
    {
      id: 6,
      name: 'Document Expiring',
      message: 'Your {{doc_type}} is expiring soon.',
      type: 'Alert'
    }]

  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
          System Alerts & Templates
        </h1>
        <p className="text-slate-500 mt-1">
          Manage automated communications and notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('email')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'email' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <MailIcon className="w-4 h-4" /> Email Templates
          </div>
        </button>
        <button
          onClick={() => setActiveTab('inapp')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inapp' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <BellIcon className="w-4 h-4" /> In-App Notifications
          </div>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'system' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4" /> System Alerts
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'email' &&
        templates.email.map((t) =>
        <Card
          key={t.id}
          className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <Badge variant={t.status === 'Active' ? 'accent' : 'neutral'}>
                    {t.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 font-mono bg-slate-50 p-1 rounded inline-block mb-2">
                  Subject: {t.subject}
                </p>
                <p className="text-xs text-slate-400">
                  Last edited: {t.lastEdited}
                </p>
              </div>
              <Button
            variant="secondary"
            icon={<EditIcon className="w-4 h-4" />}>

                Edit Template
              </Button>
            </Card>
        )}

        {activeTab === 'inapp' &&
        templates.inapp.map((t) =>
        <Card
          key={t.id}
          className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <Badge variant={t.type === 'Warning' ? 'warning' : 'primary'}>
                    {t.type}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                  {t.message}
                </p>
              </div>
              <Button
            variant="secondary"
            icon={<EditIcon className="w-4 h-4" />}>

                Edit
              </Button>
            </Card>
        )}

        {activeTab === 'system' &&
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <AlertTriangleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">
              No active system alerts
            </h3>
            <p className="text-slate-500 mt-1">
              Create an alert to display a banner to all users.
            </p>
            <Button
            variant="primary"
            className="mt-4 bg-rose-600 hover:bg-rose-700 border-none">

              Create System Alert
            </Button>
          </div>
        }
      </div>
    </div>);

}