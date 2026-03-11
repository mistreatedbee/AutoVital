import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountMaintenanceLogs,
  fetchVehicleMaintenanceLogs,
  createMaintenanceLogWithHealthUpdate,
  updateMaintenanceLog,
} from '../../services/maintenance';
import type { CreateMaintenanceLogInput, UpdateMaintenanceLogInput } from '../../services/maintenance';

export function useMaintenanceLogs(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.maintenance.list(accountId ?? ''),
    queryFn: () => fetchAccountMaintenanceLogs(accountId!),
    enabled: !!accountId,
  });
}

export function useVehicleMaintenanceLogs(
  accountId: string | null,
  vehicleId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.maintenance.byVehicle(vehicleId ?? ''),
    queryFn: () => fetchVehicleMaintenanceLogs(accountId!, vehicleId!),
    enabled: !!accountId && !!vehicleId,
  });
}

export function useCreateMaintenanceLog(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaintenanceLogInput) =>
      createMaintenanceLogWithHealthUpdate(input),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.list(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
      }
    },
  });
}

export function useUpdateMaintenanceLog(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logId,
      input,
    }: {
      logId: string;
      input: UpdateMaintenanceLogInput;
    }) => updateMaintenanceLog(accountId!, logId, input),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.list(accountId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all });
      }
    },
  });
}
