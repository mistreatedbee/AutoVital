import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountDocuments,
  fetchVehicleDocuments,
  uploadDocumentFile,
  deleteDocument,
} from '../../services/documents';

export function useDocuments(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.documents.list(accountId ?? ''),
    queryFn: () => fetchAccountDocuments(accountId!),
    enabled: !!accountId,
  });
}

export function useVehicleDocuments(
  accountId: string | null,
  vehicleId: string | null,
) {
  return useQuery({
    queryKey: [...queryKeys.documents.list(accountId ?? ''), 'vehicle', vehicleId ?? ''],
    queryFn: () => fetchVehicleDocuments(accountId!, vehicleId!),
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
