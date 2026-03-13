import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountMaintenanceLogs,
  fetchVehicleMaintenanceLogs,
  createMaintenanceLogWithHealthUpdate,
  updateMaintenanceLog,
} from '../../services/maintenance';
import type { CreateMaintenanceLogInput, UpdateMaintenanceLogInput } from '../../services/maintenance';
import { useAppMutation } from '../useAppMutation';
import { expectMutationResult } from '../../lib/mutations';

export function useMaintenanceLogs(accountId: string | null, params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...queryKeys.maintenance.list(accountId ?? ''), params ?? {}],
    queryFn: () => fetchAccountMaintenanceLogs(accountId!, params),
    enabled: !!accountId,
  });
}

export function useVehicleMaintenanceLogs(
  accountId: string | null,
  vehicleId: string | null,
  params?: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: [...queryKeys.maintenance.byVehicle(vehicleId ?? ''), params ?? {}],
    queryFn: () => fetchVehicleMaintenanceLogs(accountId!, vehicleId!, params),
    enabled: !!accountId && !!vehicleId,
  });
}

export function useCreateMaintenanceLog(accountId: string | null) {
  return useAppMutation({
    mutationFn: (input: CreateMaintenanceLogInput) =>
      createMaintenanceLogWithHealthUpdate(input),
    successMessage: 'Maintenance record saved successfully.',
    errorMessage: 'Could not save maintenance record.',
    invalidateQueryKeys: accountId
      ? [
          queryKeys.maintenance.list(accountId),
          queryKeys.maintenance.all,
          queryKeys.dashboard.overview(accountId),
          queryKeys.reports.monthly(accountId),
          queryKeys.reports.vehicles(accountId),
          queryKeys.mileage.all,
          queryKeys.vehicles.all,
          queryKeys.documents.all,
        ]
      : [queryKeys.maintenance.all],
  });
}

export function useUpdateMaintenanceLog(accountId: string | null) {
  return useAppMutation({
    mutationFn: async ({
      logId,
      input,
    }: {
      logId: string;
      input: UpdateMaintenanceLogInput;
    }) =>
      expectMutationResult(
        await updateMaintenanceLog(accountId!, logId, input),
        'Could not update maintenance record.',
      ),
    successMessage: 'Maintenance record updated successfully.',
    errorMessage: 'Could not update maintenance record.',
    invalidateQueryKeys: accountId
      ? [
          queryKeys.maintenance.list(accountId),
          queryKeys.maintenance.all,
          queryKeys.dashboard.overview(accountId),
          queryKeys.reports.monthly(accountId),
          queryKeys.reports.vehicles(accountId),
          queryKeys.mileage.all,
          queryKeys.vehicles.all,
          queryKeys.documents.all,
        ]
      : [queryKeys.maintenance.all],
  });
}
