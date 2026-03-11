import React, { useEffect, useState } from 'react';
import {
  UploadCloudIcon,
  FileTextIcon,
  SearchIcon,
  MoreVerticalIcon } from
'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  fetchAccountDocuments,
  type DocumentCard,
  uploadDocumentFile,
} from '../../services/documents';
import { useAccount } from '../../account/AccountProvider';
import { LoadingState } from '../../components/states/LoadingState';
import { useAuth } from '../../auth/AuthProvider';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../../components/ui/Modal';

export function Documents() {
  const { accountId, loading: accountLoading } = useAccount();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('insurance');

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let isMounted = true;

    fetchAccountDocuments(accountId)
      .then((docs) => {
        if (isMounted) {
          setDocuments(docs);
        }
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

  const filtered = documents.filter((doc) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      doc.name.toLowerCase().includes(term) ||
      doc.vehicle.toLowerCase().includes(term);
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !user || !selectedFile) {
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      await uploadDocumentFile({
        accountId,
        vehicleId: null,
        userId: user.id,
        type: selectedType as any,
        file: selectedFile,
      });

      const refreshed = await fetchAccountDocuments(accountId);
      setDocuments(refreshed);
      setSelectedFile(null);
      setUploadOpen(false);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Document upload failed', err);
      setUploadError(err?.message ?? 'Unable to upload document. Please try again.');
    } finally {
      setUploading(false);
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
              <ModalFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (uploading) return;
                    setUploadOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
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
          <Badge
            variant="primary"
            className="px-4 py-2 text-sm cursor-pointer"
            onClick={() => setTypeFilter('All')}>
            All
          </Badge>
          <Badge
            variant="neutral"
            className="px-4 py-2 text-sm cursor-pointer bg-white"
            onClick={() => setTypeFilter('Insurance')}>
            Insurance
          </Badge>
          <Badge
            variant="neutral"
            className="px-4 py-2 text-sm cursor-pointer bg-white"
            onClick={() => setTypeFilter('Receipt')}>
            Receipts
          </Badge>
          <Badge
            variant="neutral"
            className="px-4 py-2 text-sm cursor-pointer bg-white"
            onClick={() => setTypeFilter('Registration')}>
            Registration
          </Badge>
        </div>
      </div>

      {accountLoading || loading ? (
        <LoadingState label="Loading documents..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((doc) => (
            <Card
              key={doc.id}
              hover
              className="p-5 flex flex-col cursor-pointer"
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
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="neutral" className="text-[10px] px-2 py-0.5">
                  {doc.type}
                </Badge>
                <span className="text-xs text-slate-400">{doc.size}</span>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{doc.vehicle}</span>
                <span>{doc.date}</span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>);

}