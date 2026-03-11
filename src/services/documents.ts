import { getInsforgeClient } from '../lib/insforgeClient';

export interface DocumentCard {
  id: string | number;
  name: string;
  type: string;
  size: string;
  date: string;
  vehicle: string;
  url: string | null;
  mimeType: string | null;
}

const FALLBACK_DOCUMENTS: DocumentCard[] = [
  {
    id: 1,
    name: 'Geico Insurance Policy 2024.pdf',
    type: 'Insurance',
    size: '2.4 MB',
    date: 'Oct 05, 2023',
    vehicle: 'All',
  },
  {
    id: 2,
    name: 'Tesla_Purchase_Agreement.pdf',
    type: 'Registration',
    size: '4.1 MB',
    date: 'Jan 12, 2022',
    vehicle: 'Tesla Model 3',
  },
  {
    id: 3,
    name: 'Brake_Repair_Invoice.jpg',
    type: 'Receipt',
    size: '1.2 MB',
    date: 'Aug 15, 2023',
    vehicle: 'Ford F-150',
  },
  {
    id: 4,
    name: 'State_Inspection_2023.pdf',
    type: 'Inspection',
    size: '0.8 MB',
    date: 'Nov 20, 2022',
    vehicle: 'Tesla Model 3',
  },
];

export async function fetchAccountDocuments(
  accountId: string | null,
): Promise<DocumentCard[]> {
  if (!accountId) {
    return FALLBACK_DOCUMENTS;
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('documents')
      .select('id, name, type, size_bytes, created_at, public_url, mime_type, vehicles(make, model)')
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load documents from backend, using fallback.', error);
      return FALLBACK_DOCUMENTS;
    }

    return (data as any[]).map((row) => {
      const vehicleName =
        row.vehicles?.make && row.vehicles?.model
          ? row.vehicles.make + ' ' + row.vehicles.model
          : 'All';

      const size =
        row.size_bytes != null
          ? `${(Number(row.size_bytes) / (1024 * 1024)).toFixed(1)} MB`
          : '—';

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        size,
        date: row.created_at,
        vehicle: vehicleName,
        url: row.public_url ?? null,
        mimeType: row.mime_type ?? null,
      } as DocumentCard;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Documents service unavailable, using fallback.', err);
    return FALLBACK_DOCUMENTS;
  }
}

const DOCUMENTS_BUCKET =
  (import.meta.env.VITE_DOCUMENTS_BUCKET as string | undefined) ?? 'vehicle-documents';

interface UploadDocumentParams {
  accountId: string;
  vehicleId: string | null;
  userId: string | null;
  type: 'insurance' | 'registration' | 'inspection' | 'receipt' | 'warranty' | 'other';
  file: File;
}

export async function uploadDocumentFile(params: UploadDocumentParams) {
  const client = getInsforgeClient();

  const { data, error } = await client.storage.from(DOCUMENTS_BUCKET).uploadAuto(params.file);

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.warn('Failed to upload document file.', error);
    return null;
  }

  const { url, key, size, mimeType, name } = data as any;

  const { data: rows, error: insertError } = await client.database
    .from('documents')
    .insert([
      {
        account_id: params.accountId,
        vehicle_id: params.vehicleId,
        user_id: params.userId,
        type: params.type,
        name: name ?? params.file.name,
        storage_bucket: DOCUMENTS_BUCKET,
        storage_key: key,
        public_url: url,
        size_bytes: size ?? params.file.size,
        mime_type: mimeType ?? params.file.type,
      },
    ])
    .select('*')
    .limit(1);

  if (insertError || !rows || !rows[0]) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create document record.', insertError);
    return null;
  }

  const row = rows[0] as any;

  return {
    id: row.id as string,
    url: row.public_url as string | null,
  };
}

export async function fetchVehicleDocuments(
  accountId: string | null,
  vehicleId: string | null,
): Promise<DocumentCard[]> {
  if (!accountId || !vehicleId) {
    return [];
  }

  try {
    const client = getInsforgeClient();
    const { data, error } = await client.database
      .from('documents')
      .select('id, name, type, size_bytes, created_at, public_url, mime_type')
      .eq('account_id', accountId)
      .eq('vehicle_id', vehicleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicle documents from backend.', error);
      return [];
    }

    return (data as any[]).map((row) => {
      const size =
        row.size_bytes != null
          ? `${(Number(row.size_bytes) / (1024 * 1024)).toFixed(1)} MB`
          : '—';

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        size,
        date: row.created_at,
        vehicle: '',
        url: row.public_url ?? null,
        mimeType: row.mime_type ?? null,
      } as DocumentCard;
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicle documents service unavailable.', err);
    return [];
  }
}

export async function deleteDocument(
  documentId: string | number,
  storageBucket: string | null,
  storageKey: string | null,
  deletedByUserId: string | null,
): Promise<boolean> {
  try {
    const client = getInsforgeClient();

    const { error: updateError } = await client.database
      .from('documents')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by_user_id: deletedByUserId,
      })
      .eq('id', documentId);

    if (updateError) {
      // eslint-disable-next-line no-console
      console.warn('Failed to soft-delete document.', updateError);
      return false;
    }

    if (storageBucket && storageKey) {
      const { error: removeError } = await client.storage
        .from(storageBucket)
        .remove(storageKey);

      if (removeError) {
        // eslint-disable-next-line no-console
        console.warn('Failed to delete document file from storage.', removeError);
      }
    }

    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Document delete failed.', err);
    return false;
  }
}


