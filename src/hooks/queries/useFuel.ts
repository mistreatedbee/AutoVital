import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchFuelLogs,
  fetchFuelEfficiency,
  createFuelLogWithMileage,
} from '../../services/fuel';
import type { CreateFuelLogInput } from '../../services/fuel';
import type { PaginatedParams } from '../../lib/pagination';
import { useAppMutation } from '../useAppMutation';

export function useFuelLogs(
  accountId: string | null,
  vehicleId?: string,
  params?: PaginatedParams,
) {
  return useQuery({
    queryKey: [
      ...(vehicleId ? queryKeys.fuel.byVehicle(vehicleId) : queryKeys.fuel.list(accountId ?? '')),
      params ?? {},
    ],
    queryFn: () => fetchFuelLogs(accountId!, vehicleId, params),
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
  return useAppMutation({
    mutationFn: (input: CreateFuelLogInput) => createFuelLogWithMileage(input),
    successMessage: 'Fuel record added successfully.',
    errorMessage: 'Unable to save fuel record.',
    invalidateQueryKeys: accountId
      ? [
          queryKeys.fuel.all,
          queryKeys.dashboard.overview(accountId),
          queryKeys.reports.monthly(accountId),
          queryKeys.reports.vehicles(accountId),
          queryKeys.mileage.all,
          queryKeys.vehicles.all,
        ]
      : [queryKeys.fuel.all],
  });
}
