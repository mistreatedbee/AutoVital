import { getInsforgeClient } from '../lib/insforgeClient';
import {
  rowToDocumentCard,
  type DocumentCard,
  type DocumentCardDbRow,
} from '../lib/dbMappers';
import { toLimitOffset, type PaginatedParams, type PaginatedResult, DEFAULT_PAGE_SIZE } from '../lib/pagination';

export type { DocumentCard };

export async function fetchAccountDocuments(
  accountId: string | null,
  params?: PaginatedParams,
): Promise<PaginatedResult<DocumentCard>> {
  if (!accountId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    const q = client.database
      .from('documents')
      .select('id, name, type, size_bytes, created_at, public_url, mime_type, expires_at, vehicles(make, model)')
      .eq('account_id', accountId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load documents from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as DocumentCardDbRow[]).map(rowToDocumentCard);
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Documents service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
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
  expiresAt?: string | null;
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

  const insertPayload: Record<string, unknown> = {
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
  };
  if (params.expiresAt != null && params.expiresAt !== '') {
    insertPayload.expires_at = params.expiresAt;
  }

  const { data: rows, error: insertError } = await client.database
    .from('documents')
    .insert([insertPayload])
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
  params?: PaginatedParams,
): Promise<PaginatedResult<DocumentCard>> {
  if (!accountId || !vehicleId) {
    return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, hasMore: false };
  }

  const { limit, offset, page, pageSize } = toLimitOffset(params ?? {});

  try {
    const client = getInsforgeClient();
    const q = client.database
      .from('documents')
      .select('id, name, type, size_bytes, created_at, public_url, mime_type, expires_at')
      .eq('account_id', accountId)
      .eq('vehicle_id', vehicleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const qWithRange = q as { range?: (a: number, b: number) => typeof q };
    const { data, error } = await (qWithRange.range
      ? qWithRange.range(offset, offset + limit - 1)
      : q);

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load vehicle documents from backend.', error);
      return { items: [], page, pageSize, hasMore: false };
    }

    const items = (data as DocumentCardDbRow[]).map((row) =>
      rowToDocumentCard(row, ''),
    );
    const hasMore = items.length === limit;
    return { items, page, pageSize, hasMore };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Vehicle documents service unavailable.', err);
    return { items: [], page, pageSize, hasMore: false };
  }
}

export async function updateDocumentExpiry(
  documentId: string | number,
  expiresAt: string | null,
): Promise<boolean> {
  try {
    const client = getInsforgeClient();
    const { error } = await client.database
      .from('documents')
      .update({ expires_at: expiresAt || null })
      .eq('id', documentId);

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update document expiry.', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Document expiry update failed.', err);
    return false;
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


