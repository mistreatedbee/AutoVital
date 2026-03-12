import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchFuelLogs,
  fetchFuelEfficiency,
  createFuelLogWithMileage,
} from '../../services/fuel';
import type { CreateFuelLogInput } from '../../services/fuel';

export function useFuelLogs(
  accountId: string | null,
  vehicleId?: string,
) {
  return useQuery({
    queryKey: vehicleId
      ? queryKeys.fuel.byVehicle(vehicleId)
      : queryKeys.fuel.list(accountId ?? ''),
    queryFn: () => fetchFuelLogs(accountId!, vehicleId),
    enabled: !!accountId,
  });
}

export function useFuelEfficiency(accountId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.fuel.all, 'efficiency', accountId ?? ''],
    queryFn: () => fetchFuelEfficiency(accountId!),
    enabled: !!accountId,
  });
}

export function useCreateFuelLog(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFuelLogInput) => createFuelLogWithMileage(input),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.fuel.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.monthly(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.vehicles(accountId) });
      }
    },
  });
}
