import React, { useState } from 'react';
import {
  UploadCloudIcon,
  FileTextIcon,
  SearchIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useDocuments, useUploadDocument } from '../../hooks/queries';
import { useAccount } from '../../account/AccountProvider';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { DocumentsSkeleton } from '../../components/states/pageSkeletons';
import { useAuth } from '../../auth/AuthProvider';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '../../components/ui/Modal';

import { formatDateShort } from '../../lib/formatters';

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) {
    return (
      <Badge variant="warning" className="text-[10px] px-2 py-0.5">
        Expired
      </Badge>
    );
  }
  if (daysLeft <= 14) {
    return (
      <Badge variant="warning" className="text-[10px] px-2 py-0.5">
        Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
      Expires {formatDateShort(expiry)}
    </Badge>
  );
}

export function Documents() {
  const { accountId, loading: accountLoading } = useAccount();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data: documentsResult, isLoading, isError, error, refetch } = useDocuments(accountId, { page, pageSize: 20 });
  const documents = documentsResult?.items ?? [];
  const hasMore = documentsResult?.hasMore ?? false;
  const uploadMutation = useUploadDocument(accountId);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('insurance');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const filtered = documents.filter((doc) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      doc.name.toLowerCase().includes(term) ||
      doc.vehicle.toLowerCase().includes(term);
    const matchesType = typeFilter === 'All' || doc.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !user || !selectedFile) return;

    setUploadError(null);

    try {
      await uploadMutation.mutateAsync({
        accountId,
        vehicleId: null,
        userId: user.id,
        type: selectedType as
          | 'insurance'
          | 'registration'
          | 'inspection'
          | 'receipt'
          | 'warranty'
          | 'other',
        file: selectedFile,
        expiresAt: expiresAt || undefined,
      });

      setSelectedFile(null);
      setExpiresAt('');
      setUploadOpen(false);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Document upload failed', err);
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Unable to upload document. Please try again.',
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">
            Documents
          </h1>
          <p className="text-slate-500 mt-1">
            Securely store receipts, insurance, and registrations.
          </p>
        </div>
        <Modal open={uploadOpen} onOpenChange={setUploadOpen}>
          <ModalTrigger asChild>
            <Button
              variant="primary"
              icon={<UploadCloudIcon className="w-4 h-4" />}>
              Upload File
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Upload Document</ModalTitle>
            </ModalHeader>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setSelectedFile(file);
                  }}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="insurance">Insurance</option>
                  <option value="registration">Registration</option>
                  <option value="inspection">Inspection</option>
                  <option value="receipt">Receipt</option>
                  <option value="warranty">Warranty</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {(selectedType === 'insurance' || selectedType === 'registration' || selectedType === 'inspection') && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Expiry date
                    <span className="text-slate-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}
              <ModalFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (uploadMutation.isPending) return;
                    setUploadOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedFile || uploadMutation.isPending}
                  loading={uploadMutation.isPending}
                  loadingText="Uploading..."
                >
                  Upload
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>

      {/* Dropzone */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-12 text-center hover:bg-slate-100 transition-colors">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloudIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Upload service receipts, insurance, and registrations
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          PDF, JPG, PNG, or DOCX (max. 10MB). Documents are securely encrypted
          and stored.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            icon={<SearchIcon className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)} />

        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button type="button" onClick={() => setTypeFilter('All')}>
            <Badge variant="primary" className="px-4 py-2 text-sm cursor-pointer">
              All
            </Badge>
          </button>
          <button type="button" onClick={() => setTypeFilter('Insurance')}>
            <Badge variant="neutral" className="px-4 py-2 text-sm cursor-pointer bg-white">
              Insurance
            </Badge>
          </button>
          <button type="button" onClick={() => setTypeFilter('Receipt')}>
            <Badge variant="neutral" className="px-4 py-2 text-sm cursor-pointer bg-white">
              Receipts
            </Badge>
          </button>
          <button type="button" onClick={() => setTypeFilter('Registration')}>
            <Badge variant="neutral" className="px-4 py-2 text-sm cursor-pointer bg-white">
              Registration
            </Badge>
          </button>
        </div>
      </div>

      {accountLoading || isLoading ? (
        <DocumentsSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-cardToken p-6">
          <ErrorState
            title="Failed to load documents"
            description={error instanceof Error ? error.message : 'Unable to load documents.'}
            onRetry={() => refetch()}
          />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-border bg-cardToken p-12">
          <EmptyState
            icon={<FileTextIcon className="w-16 h-16" />}
            title="No documents yet"
            description="Upload service receipts, insurance cards, and registrations to keep everything in one place."
            action={
              <Button
                variant="primary"
                icon={<UploadCloudIcon className="w-4 h-4" />}
                onClick={() => setUploadOpen(true)}>
                Upload your first document
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-cardToken p-12">
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="No matching documents"
            description="Try adjusting your search or filter."
          />
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              hover
              className="p-6 flex flex-col cursor-pointer"
              onClick={() => {
                if (doc.url) {
                  window.open(doc.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (doc.url) {
                      window.open(doc.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <MoreVerticalIcon className="w-5 h-5" />
                </button>
              </div>
              <h4
                className="font-semibold text-slate-900 mb-1 truncate"
                title={doc.name}
              >
                {doc.name}
              </h4>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
                  {doc.type}
                </Badge>
                <span className="text-xs text-slate-400">{doc.size}</span>
                {doc.expiresAt && (
                  <ExpiryBadge expiresAt={doc.expiresAt} />
                )}
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{doc.vehicle}</span>
                <span>{formatDateShort(doc.date)}</span>
              </div>
            </Card>
          ))}
        </div>
        {(hasMore || page > 1) && (
          <div className="flex justify-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}>
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-slate-600">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || isLoading}>
              Next
            </Button>
          </div>
        )}
        </>
      )}
    </div>
  );

}
