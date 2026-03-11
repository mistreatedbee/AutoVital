import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon, FileTextIcon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import {
  fetchAuditLogs,
  type AuditLogEntry,
} from '../../services/auditLog';

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [detailEntry, setDetailEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchAuditLogs({
          actorEmail: actorFilter.trim() || undefined,
          action: actionFilter.trim() || undefined,
          entityType: entityTypeFilter.trim() || undefined,
        });
        if (!cancelled) {
          setRows(data);
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
  }, [actorFilter, actionFilter, entityTypeFilter]);

  const entityTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.entityType))).sort(),
    [rows],
  );

  const actions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.action))).sort(),
    [rows],
  );

  const columns = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Time',
        render: (value: string) => (
          <span className="text-sm text-slate-600">
            {value ? new Date(value).toLocaleString() : '—'}
          </span>
        ),
      },
      {
        key: 'actorEmail',
        header: 'Actor',
        render: (value: string | null) => (
          <span className="text-sm">{value ?? '—'}</span>
        ),
      },
      {
        key: 'action',
        header: 'Action',
        render: (value: string) => (
          <span className="font-medium text-slate-900">{value}</span>
        ),
      },
      {
        key: 'entityType',
        header: 'Entity Type',
      },
      {
        key: 'entityId',
        header: 'Entity ID',
        render: (value: string | null) =>
          value ? (
            <span className="font-mono text-xs text-slate-500 truncate max-w-[140px] block">
              {value}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: 'details',
        header: '',
        render: (_: unknown, row: AuditLogEntry) => (
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={() => setDetailEntry(row)}
          >
            <FileTextIcon className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Audit Logs
          </h1>
          <p className="text-slate-500 mt-1">
            View admin actions logged across the platform.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter by actor email..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 shadow-sm"
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
          >
            <option value="">All entity types</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button variant="secondary" icon={<FilterIcon className="w-4 h-4" />}>
            Filters
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading audit logs...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No audit log entries match the current filters. Admin actions will
            appear here once the audit_logs table exists and actions are logged.
          </div>
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>

      {detailEntry && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDetailEntry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Audit Log Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Time</dt>
                <dd>{new Date(detailEntry.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Actor</dt>
                <dd>{detailEntry.actorEmail ?? detailEntry.actorUserId ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Action</dt>
                <dd>{detailEntry.action}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Entity</dt>
                <dd>
                  {detailEntry.entityType}
                  {detailEntry.entityId && ` (${detailEntry.entityId})`}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 mb-1">Metadata</dt>
                <dd>
                  <pre className="bg-slate-50 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(detailEntry.metadata, null, 2)}
                  </pre>
                </dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setDetailEntry(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
