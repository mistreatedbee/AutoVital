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
} from '../../services/documents';

export function Documents() {
  const [documents, setDocuments] = useState<DocumentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;

    fetchAccountDocuments()
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
  }, []);

  const filtered = documents.filter((doc) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      doc.name.toLowerCase().includes(term) ||
      doc.vehicle.toLowerCase().includes(term);
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
        <Button
          variant="primary"
          icon={<UploadCloudIcon className="w-4 h-4" />}>

          Upload File
        </Button>
      </div>

      {/* Dropzone */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-12 text-center hover:bg-slate-100 transition-colors cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
          <UploadCloudIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Click to upload or drag and drop
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

      {loading ? (
        <div className="text-slate-500">Loading documents...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((doc) =>
          <Card key={doc.id} hover className="p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5" />
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVerticalIcon className="w-5 h-5" />
                </button>
              </div>
              <h4
              className="font-semibold text-slate-900 mb-1 truncate"
              title={doc.name}>

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