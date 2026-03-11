import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, FilterIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import {
  fetchAccountMaintenanceLogs,
  type MaintenanceEntry,
  createMaintenanceLogWithHealthUpdate,
  type CreateMaintenanceLogInput,
  updateMaintenanceLog,
} from '../../services/maintenance';
import { fetchAccountVehicles, type VehicleSummary } from '../../services/vehicles';
import { uploadDocumentFile } from '../../services/documents';
import { useAuth } from '../../auth/AuthProvider';

type FormMode = 'create' | 'edit';

interface MaintenanceFormState {
  id?: string | number;
  vehicleId: string;
  type: string;
  serviceDate: string;
  mileage: string;
  cost: string;
  currency: string;
  vendorName: string;
  description: string;
  documentFile: File | null;
}

const EMPTY_FORM: MaintenanceFormState = {
  vehicleId: '',
  type: 'oil_change',
  serviceDate: '',
  mileage: '',
  cost: '',
  currency: 'USD',
  vendorName: '',
  description: '',
  documentFile: null,
};

export function MaintenanceLog() {
  const { accountId, loading: accountLoading } = useAccount();
  const { user } = useAuth();
  const [logs, setLogs] = useState<MaintenanceEntry[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [formState, setFormState] = useState<MaintenanceFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([fetchAccountMaintenanceLogs(accountId), fetchAccountVehicles(accountId)])
      .then(([logRows, vehicleRows]) => {
        if (!isMounted) return;
        setLogs(logRows);
        setVehicles(vehicleRows);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.id,
        label: v.name,
      })),
    [vehicles],
  );

  const filteredLogs = useMemo(() => {
    if (vehicleFilter === 'all') {
      return logs;
    }
    return logs.filter((log) => log.vehicleId === vehicleFilter);
  }, [logs, vehicleFilter]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (val: string) => <span className="font-medium text-slate-900">{val}</span>,
    },
    {
      key: 'service',
      header: 'Service Type',
    },
    {
      key: 'mileage',
      header: 'Mileage',
    },
    {
      key: 'cost',
      header: 'Cost',
    },
    {
      key: 'shop',
      header: 'Workshop',
    },
    {
      key: 'status',
      header: 'Status',
      render: (val: string) => <Badge variant="neutral">{val}</Badge>,
    },
    {
      key: 'documentId',
      header: 'Receipt',
      render: (_: any, row: MaintenanceEntry) =>
        row.documentId ? (
          <span className="inline-flex items-center gap-1 text-primary-600 text-xs">
            Attached
            <ExternalLinkIcon className="w-3 h-3" />
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  const openCreateForm = () => {
    setFormMode('create');
    setFormState(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  };

  const openEditForm = (entry: MaintenanceEntry) => {
    setFormMode('edit');
    setFormState({
      id: entry.id,
      vehicleId: entry.vehicleId ?? '',
      type: entry.service,
      serviceDate: entry.date,
      mileage: entry.mileage ? entry.mileage.replace(/,/g, '') : '',
      cost: entry.cost ? entry.cost.replace(/[^0-9.]/g, '') : '',
      currency: 'USD',
      vendorName: entry.shop ?? '',
      description: '',
      documentFile: null,
    });
    setError(null);
    setFormOpen(true);
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!accountId || !user) return;

    if (!formState.vehicleId || !formState.type || !formState.serviceDate) {
      setError('Vehicle, service type, and date are required.');
      return;
    }

    const mileageNumber =
      formState.mileage.trim() !== '' ? Number(formState.mileage.replace(/,/g, '')) : null;
    if (mileageNumber != null && (Number.isNaN(mileageNumber) || mileageNumber < 0)) {
      setError('Mileage must be a non-negative number.');
      return;
    }

    const costNumber =
      formState.cost.trim() !== '' ? Math.round(Number(formState.cost) * 100) : null;
    if (costNumber != null && (Number.isNaN(costNumber) || costNumber < 0)) {
      setError('Cost must be a non-negative number.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let documentId: string | null | undefined = undefined;

      if (formState.documentFile) {
        const uploaded = await uploadDocumentFile({
          accountId,
          vehicleId: formState.vehicleId,
          userId: user.id,
          type: 'receipt',
          file: formState.documentFile,
        });
        documentId = uploaded?.id ?? null;
      }

      if (formMode === 'create') {
        const payload: CreateMaintenanceLogInput = {
          accountId,
          vehicleId: formState.vehicleId,
          userId: user.id,
          type: formState.type,
          description: formState.description || null,
          mileage: mileageNumber,
          serviceDate: formState.serviceDate,
          costCents: costNumber,
          currency: formState.currency || 'USD',
          vendorName: formState.vendorName || null,
          documentId,
        };

        await createMaintenanceLogWithHealthUpdate(payload);
      } else if (formMode === 'edit' && typeof formState.id === 'string') {
        await updateMaintenanceLog(accountId, formState.id, {
          type: formState.type,
          description: formState.description || null,
          mileage: mileageNumber,
          serviceDate: formState.serviceDate,
          costCents: costNumber,
          currency: formState.currency || 'USD',
          vendorName: formState.vendorName || null,
          documentId,
        });
      }

      const refreshed = await fetchAccountMaintenanceLogs(accountId);
      setLogs(refreshed);
      setFormOpen(false);
      setFormState(EMPTY_FORM);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to save maintenance log', err);
      setError(err?.message ?? 'Unable to save maintenance log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Maintenance Log
          </h1>
          <p className="text-slate-500 mt-1">
            Complete history of all services across your vehicles.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<DownloadIcon className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={openCreateForm}>
            Log Service
          </Button>
        </div>
      </div>

      {formOpen && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 font-heading mb-4">
            {formMode === 'create' ? 'Log Service' : 'Edit Service'}
          </h2>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Vehicle"
                value={formState.vehicleId}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, vehicleId: e.target.value }))
                }
                required
              >
                <option value="">Select vehicle</option>
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Service Type"
                value={formState.type}
                onChange={(e) => setFormState((prev) => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="oil_change">Oil Change</option>
                <option value="tire_rotation">Tire Rotation</option>
                <option value="inspection">Inspection</option>
                <option value="brake_service">Brake Service</option>
                <option value="battery">Battery</option>
                <option value="registration">Registration</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Service Date"
                type="date"
                value={formState.serviceDate}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, serviceDate: e.target.value }))
                }
                required
              />
              <Input
                label="Mileage"
                type="number"
                placeholder="24500"
                value={formState.mileage}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, mileage: e.target.value }))
                }
              />
              <Input
                label="Cost"
                type="number"
                step="0.01"
                placeholder="120.00"
                value={formState.cost}
                onChange={(e) => setFormState((prev) => ({ ...prev, cost: e.target.value }))}
              />
              <Input
                label="Currency"
                placeholder="USD"
                value={formState.currency}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, currency: e.target.value }))
                }
              />
              <Input
                label="Workshop"
                placeholder="Tesla Service Center"
                value={formState.vendorName}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, vendorName: e.target.value }))
                }
              />
            </div>
            <Input
              label="Description"
              placeholder="Notes about this service"
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attach Receipt (optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFormState((prev) => ({ ...prev, documentFile: file }));
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-200 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                  setFormState(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                {formMode === 'create' ? 'Save Service' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              {vehicleOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5">
              <option>All Time</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" icon={<FilterIcon className="w-4 h-4" />}>
            More Filters
          </Button>
        </div>
        {accountLoading || loading ? (
          <LoadingState label="Loading maintenance history..." className="py-10" />
        ) : (
          <DataTable
            columns={columns}
            data={filteredLogs}
            className="border-none rounded-none"
          />
        )}
      </Card>
    </div>
  );
}