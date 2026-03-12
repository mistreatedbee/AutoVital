import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchAccountVehicles,
  archiveVehicle,
  fetchVehicleDetails,
  upsertVehicle,
} from '../../services/vehicles';
import { recomputeAndPersistVehicleHealth } from '../../services/vehicleHealth';
import type { UpsertVehicleInput } from '../../services/vehicles';
import type { Vehicle } from '../../domain/models';
import type { PaginatedParams } from '../../lib/pagination';

export function useVehicles(accountId: string | null, params?: PaginatedParams) {
  return useQuery({
    queryKey: [...queryKeys.vehicles.list(accountId ?? ''), params ?? {}],
    queryFn: () => fetchAccountVehicles(accountId!, params),
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

export function useUpsertVehicle(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertVehicleInput): Promise<Vehicle | null> => {
      const vehicle = await upsertVehicle(input);
      if (!vehicle) return null;
      return recomputeAndPersistVehicleHealth(vehicle, null);
    },
    onSuccess: (vehicle) => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.list(accountId) });
        if (vehicle?.id) {
          queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.detail(vehicle.id) });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
      }
    },
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
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview(accountId) });
      }
    },
  });
}
