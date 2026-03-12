import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountDocuments,
  fetchVehicleDocuments,
  uploadDocumentFile,
  deleteDocument,
} from '../../services/documents';
import type { PaginatedParams } from '../../lib/pagination';

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocumentFile,
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.list(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
      }
    },
  });
}

export function useDeleteDocument(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
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
      deleteDocument(documentId, storageBucket, storageKey, deletedByUserId),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.list(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
      }
    },
  });
}
