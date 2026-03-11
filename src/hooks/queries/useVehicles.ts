import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountVehicles,
  archiveVehicle,
  fetchVehicleDetails,
} from '../../services/vehicles';

export function useVehicles(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.list(accountId ?? ''),
    queryFn: () => fetchAccountVehicles(accountId!),
    enabled: !!accountId,
  });
}

export function useVehicleDetails(accountId: string | null, vehicleId: string | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(vehicleId ?? ''),
    queryFn: () => fetchVehicleDetails(accountId!, vehicleId!),
    enabled: !!accountId && !!vehicleId,
  });
}

export function useArchiveVehicle(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => archiveVehicle(accountId!, vehicleId),
    onSuccess: (_, vehicleId) => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicleId) });
      }
    },
  });
}
