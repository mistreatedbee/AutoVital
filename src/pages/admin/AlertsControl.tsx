import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MailIcon, BellIcon, AlertTriangleIcon, EditIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  fetchEmailTemplates,
  fetchInAppTemplates,
  updateEmailTemplate,
  updateInAppTemplate,
  type EmailTemplate,
  type InAppTemplate,
} from '../../services/alerts';
import { useAuth } from '../../auth/AuthProvider';
import { auditTemplateUpdated } from '../../lib/auditEvents';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';

export function AlertsControl() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actor = { userId: user?.id ?? null, email: user?.email ?? null };
  const [activeTab, setActiveTab] = useState('email');
  const [editEmail, setEditEmail] = useState<EmailTemplate | null>(null);
  const [editInApp, setEditInApp] = useState<InAppTemplate | null>(null);

  const { data: emailTemplates = [], isLoading: emailLoading } = useQuery({
    queryKey: ['admin', 'emailTemplates'],
    queryFn: fetchEmailTemplates,
  });

  const { data: inAppTemplates = [], isLoading: inAppLoading } = useQuery({
    queryKey: ['admin', 'inAppTemplates'],
    queryFn: fetchInAppTemplates,
  });

  const formatLastEdited = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString('en-ZA');
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
        {activeTab === 'email' && (
          <>
            {emailLoading ? (
              <LoadingState label="Loading email templates..." />
            ) : emailTemplates.length === 0 ? (
              <EmptyState
                title="No email templates"
                description="Templates will appear here once they are created in the database."
              />
            ) : (
              emailTemplates.map((t) => (
                <Card
                  key={t.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900">{t.name}</h3>
                      <Badge variant={t.status === 'active' ? 'accent' : 'neutral'}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-mono bg-slate-50 p-1 rounded inline-block mb-2">
                      Subject: {t.subject}
                    </p>
                    <p className="text-xs text-slate-400">
                      Last edited: {formatLastEdited(t.lastEdited)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    icon={<EditIcon className="w-4 h-4" />}
                    onClick={() => setEditEmail(t)}>
                    Edit Template
                  </Button>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'inapp' && (
          <>
            {inAppLoading ? (
              <LoadingState label="Loading in-app templates..." />
            ) : inAppTemplates.length === 0 ? (
              <EmptyState
                title="No in-app templates"
                description="Templates will appear here once they are created in the database."
              />
            ) : (
              inAppTemplates.map((t) => (
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
                    icon={<EditIcon className="w-4 h-4" />}
                    onClick={() => setEditInApp(t)}>
                    Edit
                  </Button>
                </Card>
              ))
            )}
          </>
        )}

        {activeTab === 'system' && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <AlertTriangleIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">
              No active system alerts
            </h3>
            <p className="text-slate-500 mt-1">
              Create an alert to display a banner to all users.
            </p>
            <Button variant="primary" className="mt-4 bg-rose-600 hover:bg-rose-700 border-none">
              Create System Alert
            </Button>
          </div>
        )}
      </div>

      {editEmail && (
        <EmailTemplateModal
          template={editEmail}
          onClose={() => setEditEmail(null)}
          onSaved={() => {
            setEditEmail(null);
            void queryClient.invalidateQueries({ queryKey: ['admin', 'emailTemplates'] });
          }}
          actor={actor}
        />
      )}
      {editInApp && (
        <InAppTemplateModal
          template={editInApp}
          onClose={() => setEditInApp(null)}
          onSaved={() => {
            setEditInApp(null);
            void queryClient.invalidateQueries({ queryKey: ['admin', 'inAppTemplates'] });
          }}
          actor={actor}
        />
      )}
    </div>
  );
}

function EmailTemplateModal({
  template,
  onClose,
  onSaved,
  actor,
}: {
  template: EmailTemplate;
  onClose: () => void;
  onSaved: () => void;
  actor: { userId: string | null; email: string | null };
}) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [status, setStatus] = useState(template.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await updateEmailTemplate(template.id, { name, subject, status });
      if (ok) {
        await auditTemplateUpdated(actor, String(template.id), { type: 'email', name });
        onSaved();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Email Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InAppTemplateModal({
  template,
  onClose,
  onSaved,
  actor,
}: {
  template: InAppTemplate;
  onClose: () => void;
  onSaved: () => void;
  actor: { userId: string | null; email: string | null };
}) {
  const [name, setName] = useState(template.name);
  const [message, setMessage] = useState(template.message);
  const [type, setType] = useState(template.type);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await updateInAppTemplate(template.id, { name, message, type });
      if (ok) {
        await auditTemplateUpdated(actor, String(template.id), { type: 'in_app', name });
        onSaved();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Edit In-App Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}>
              <option value="Warning">Warning</option>
              <option value="Alert">Alert</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
