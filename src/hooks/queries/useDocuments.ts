import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountDocuments,
  fetchVehicleDocuments,
  uploadDocumentFile,
  deleteDocument,
} from '../../services/documents';
import type { PaginatedParams } from '../../lib/pagination';
import { useAppMutation } from '../useAppMutation';
import { expectMutationResult } from '../../lib/mutations';

export function useDocuments(accountId: string | null, params?: PaginatedParams) {
  return useQuery({
    queryKey: [...queryKeys.documents.list(accountId ?? ''), params ?? {}],
    queryFn: () => fetchAccountDocuments(accountId!, params),
    enabled: !!accountId,
  });
}

export function useVehicleDocuments(
  accountId: string | null,
  vehicleId: string | null,
  params?: PaginatedParams,
) {
  return useQuery({
    queryKey: [...queryKeys.documents.list(accountId ?? ''), 'vehicle', vehicleId ?? '', params ?? {}],
    queryFn: () => fetchVehicleDocuments(accountId!, vehicleId!, params),
    enabled: !!accountId && !!vehicleId,
  });
}

export function useUploadDocument(accountId: string | null) {
  return useAppMutation({
    mutationFn: async (input: Parameters<typeof uploadDocumentFile>[0]) =>
      expectMutationResult(
        await uploadDocumentFile(input),
        'Upload failed. Please try again.',
      ),
    successMessage: 'Document uploaded successfully.',
    errorMessage: 'Upload failed. Please try again.',
    invalidateQueryKeys: accountId
      ? [queryKeys.documents.list(accountId), queryKeys.dashboard.overview(accountId), queryKeys.documents.all]
      : [queryKeys.documents.all],
  });
}

export function useDeleteDocument(accountId: string | null) {
  return useAppMutation({
    mutationFn: async ({
      documentId,
      storageBucket,
      storageKey,
      deletedByUserId,
    }: {
      documentId: string | number;
      storageBucket: string | null;
      storageKey: string | null;
      deletedByUserId: string | null;
    }) =>
      expectMutationResult(
        await deleteDocument(documentId, storageBucket, storageKey, deletedByUserId),
        'Could not delete document.',
      ),
    successMessage: 'Document deleted successfully.',
    errorMessage: 'Could not delete document.',
    invalidateQueryKeys: accountId
      ? [queryKeys.documents.list(accountId), queryKeys.dashboard.overview(accountId), queryKeys.documents.all]
      : [queryKeys.documents.all],
  });
}
