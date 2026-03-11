import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  DollarSignIcon,
  EditIcon,
  SettingsIcon,
  WrenchIcon,
  FuelIcon,
  PlusIcon,
  UploadCloudIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import {
  useVehicleDetails,
  useArchiveVehicle,
  useVehicleMaintenanceLogs,
  useVehicleDocuments,
  useUploadDocument,
} from '../../hooks/queries';
import { uploadVehicleImageFile } from '../../services/vehicleImageUpload';
import { setPrimaryVehicleImage } from '../../services/vehicleImages';
import { useAuth } from '../../auth/AuthProvider';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '../../components/ui/Modal';

export function VehicleDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { accountId } = useAccount();
  const { user } = useAuth();

  const { data: vehicleDetails, isLoading, error, refetch } = useVehicleDetails(accountId, id);
  const { data: serviceHistory = [] } = useVehicleMaintenanceLogs(accountId, id);
  const { data: documents = [], isLoading: documentsLoading } = useVehicleDocuments(
    accountId,
    id,
  );
  const queryClient = useQueryClient();
  const archiveMutation = useArchiveVehicle(accountId);
  const uploadDocMutation = useUploadDocument(accountId);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('other');
  const [docExpiresAt, setDocExpiresAt] = useState<string>('');

  const columns = [
    {
      key: 'date',
      header: 'Date',
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
  ];

  if (!accountId) {
    return <LoadingState label="Loading account..." />;
  }

  if (isLoading) {
    return <LoadingState label="Loading vehicle details..." />;
  }

  if (error || !vehicleDetails) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Vehicle not found"
          description={error instanceof Error ? error.message : 'This vehicle may have been removed or you may not have access to it.'}
          onRetry={() => refetch()}
        />
        <Button variant="secondary" onClick={() => navigate('/dashboard/vehicles')}>
          Back to My Vehicles
        </Button>
      </div>
    );
  }

  const { vehicle, images, health } = vehicleDetails;
  const heroImage =
    vehicle.heroImageUrl ||
    (images.find((img: any) => img.isPrimary) ?? images[0])?.url ||
    null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/vehicles"
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
                {vehicle.nickname || `${vehicle.year ?? ''} ${vehicle.make} ${vehicle.model}`.trim()}
              </h1>
              {vehicle.year && <Badge variant="neutral">{vehicle.year}</Badge>}
            </div>
            <p className="text-slate-500 mt-1">
              {vehicle.vin && <>VIN: {vehicle.vin} • </>}
              {vehicle.licensePlate && <>License: {vehicle.licensePlate}</>}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<EditIcon className="w-4 h-4" />}
            onClick={() => navigate(`/dashboard/vehicles/${vehicle.id}/edit`)}>
            Edit Vehicle
          </Button>
          <Button
            variant="ghost"
            className="text-red-600"
            disabled={archiveMutation.isPending}
            onClick={async () => {
              if (!accountId) return;
              const confirmed = window.confirm(
                'Archive this vehicle? It will be hidden from your garage but not permanently deleted.',
              );
              if (!confirmed) return;
              archiveMutation.mutate(vehicle.id, {
                onSuccess: () => navigate('/dashboard/vehicles'),
              });
            }}>
            {archiveMutation.isPending ? 'Archiving…' : 'Archive'}
          </Button>
        </div>
      </div>

      {/* Top Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-64 relative">
            {heroImage ? (
              <img
                src={heroImage}
                alt={vehicle.nickname ?? vehicle.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                No photo
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="flex gap-6 text-white">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Current Mileage</p>
                  <p className="text-2xl font-bold font-heading">
                    {vehicle.currentMileage != null
                      ? `${vehicle.currentMileage.toLocaleString()} mi`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Engine Type</p>
                  <p className="text-2xl font-bold font-heading">
                    {vehicle.fuelType ? vehicle.fuelType.toString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Photos</h3>
                {uploadError && (
                  <span className="text-xs text-red-600">{uploadError}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center text-xs text-slate-600 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (!accountId || !id) return;
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadError(null);
                      setImageUploading(true);
                      try {
                        await uploadVehicleImageFile({
                          accountId,
                          vehicleId: vehicle.id,
                          file,
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['vehicles', 'detail', id],
                        });
                      } catch (err: unknown) {
                        // eslint-disable-next-line no-console
                        console.error('Vehicle photo upload failed', err);
                        setUploadError('Unable to upload photo. Please try again.');
                      } finally {
                        setImageUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <PlusIcon className="w-3 h-3" />
                    {imageUploading ? 'Uploading…' : 'Add Photo'}
                  </span>
                </label>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`relative rounded-md overflow-hidden border ${
                      img.isPrimary ? 'border-primary-500' : 'border-slate-200'
                    }`}
                    onClick={async () => {
                      if (!accountId) return;
                      if (img.isPrimary) return;
                      try {
                        await setPrimaryVehicleImage(accountId, vehicle.id, img.id);
                        queryClient.invalidateQueries({
                          queryKey: ['vehicles', 'detail', id],
                        });
                      } catch (err: unknown) {
                        // eslint-disable-next-line no-console
                        console.error('Failed to set primary vehicle image', err);
                      }
                    }}
                  >
                    <img
                      src={img.url}
                      alt={vehicle.nickname ?? vehicle.model}
                      className="h-16 w-24 object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute bottom-1 left-1 rounded-full bg-primary-600/90 text-[10px] font-semibold text-white px-2 py-0.5">
                        Primary
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center bg-sidebar text-white border-sidebar-border">
          <h3 className="text-sidebar-foreground/80 font-medium mb-6">
            Overall Health Score
          </h3>
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100">

              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="10" />

              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset="5.66"
                className="transition-all duration-1000 ease-out" />

            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-heading">
                {health.score != null ? (
                  <>
                    {health.score}
                    <span className="text-2xl text-sidebar-foreground/80">%</span>
                  </>
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>
          <Badge
            variant="accent"
            className="bg-accentToken/20 text-accentToken border-accentToken/30">
            {health.status === 'excellent'
              ? 'System Optimal'
              : health.status === 'good'
                ? 'Good Condition'
                : health.status === 'fair'
                  ? 'Needs Attention'
                  : health.status === 'poor'
                    ? 'Service Recommended'
                    : 'Health Unknown'}
          </Badge>
        </Card>
      </div>

      {/* Tabs / Content Area */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button className="px-4 py-3 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
            Overview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Recent Service History
                </h3>
              </div>
              <DataTable columns={columns} data={serviceHistory} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Documents
              </h3>
              {documentUploadError && (
                <p className="text-xs text-red-600 mb-2">{documentUploadError}</p>
              )}
              <div className="space-y-3">
                {documentsLoading ? (
                  <p className="text-sm text-slate-500">Loading documents…</p>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No documents linked to this vehicle yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          className="text-left text-slate-800 hover:text-primary-600 truncate"
                          onClick={() => {
                            if (doc.url) {
                              window.open(doc.url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <span className="font-medium">{doc.name}</span>
                          <span className="ml-2 text-xs text-slate-500">{doc.type}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          {doc.expiresAt && (
                            <span className="text-xs text-amber-600">
                              Expires {new Date(doc.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">{doc.date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-4">
                <Modal open={documentUploadOpen} onOpenChange={setDocumentUploadOpen}>
                  <ModalTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<UploadCloudIcon className="w-4 h-4" />}
                    >
                      Add Document
                    </Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Upload Document</ModalTitle>
                    </ModalHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!accountId || !user || !vehicleDetails || !docFile) return;
                        setDocumentUploadError(null);
                        try {
                          await uploadDocMutation.mutateAsync({
                            accountId,
                            vehicleId: vehicleDetails.vehicle.id,
                            userId: user.id,
                            type: docType as
                              | 'insurance'
                              | 'registration'
                              | 'inspection'
                              | 'receipt'
                              | 'warranty'
                              | 'other',
                            file: docFile,
                            expiresAt: docExpiresAt || undefined,
                          });
                          setDocFile(null);
                          setDocExpiresAt('');
                          setDocumentUploadOpen(false);
                        } catch (err: unknown) {
                          // eslint-disable-next-line no-console
                          console.error('Vehicle document upload failed', err);
                          setDocumentUploadError(
                            err instanceof Error
                              ? err.message
                              : 'Unable to upload document. Please try again.',
                          );
                        }
                      }}
                      className="space-y-4"
                    >
                      {documentUploadError && (
                        <p className="text-sm text-red-600">{documentUploadError}</p>
                      )}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">File</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          required
                          onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Type</label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="insurance">Insurance</option>
                          <option value="registration">Registration</option>
                          <option value="inspection">Inspection</option>
                          <option value="receipt">Receipt</option>
                          <option value="warranty">Warranty</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {(docType === 'insurance' || docType === 'registration' || docType === 'inspection') && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700">
                            Expiry date
                            <span className="text-slate-400 font-normal ml-1">(optional)</span>
                          </label>
                          <input
                            type="date"
                            value={docExpiresAt}
                            onChange={(e) => setDocExpiresAt(e.target.value)}
                            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                          />
                        </div>
                      )}
                      <ModalFooter>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setDocumentUploadOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={!docFile || uploadDocMutation.isPending}
                        >
                          {uploadDocMutation.isPending ? 'Uploading…' : 'Upload'}
                        </Button>
                      </ModalFooter>
                    </form>
                  </ModalContent>
                </Modal>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Upcoming Maintenance
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Based on age, mileage, and service history
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Use this section to identify when to schedule your next service.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Log Service
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <DollarSignIcon className="w-4 h-4" /> Total Spent
                  </span>
                  <span className="font-semibold text-slate-900">—</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2">
                    <WrenchIcon className="w-4 h-4" /> Services Logged
                  </span>
                  <span className="font-semibold text-slate-900">
                    {serviceHistory.length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FuelIcon className="w-4 h-4" /> Avg Efficiency
                  </span>
                  <span className="font-semibold text-slate-900">—</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}