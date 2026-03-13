import { useQuery, type QueryKey } from '@tanstack/react-query';
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
import { useAppMutation } from '../useAppMutation';
import { expectMutationResult } from '../../lib/mutations';

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
  return useAppMutation({
    mutationFn: async (input: UpsertVehicleInput): Promise<Vehicle | null> => {
      const vehicle = expectMutationResult(
        await upsertVehicle(input),
        'Could not save vehicle.',
      );
      return recomputeAndPersistVehicleHealth(vehicle, null);
    },
    successMessage: ({ variables }) =>
      variables.id ? 'Vehicle updated successfully.' : 'Vehicle saved successfully.',
    errorMessage: 'Could not save vehicle.',
    invalidateQueryKeys: ({ data }) => {
      const keys: QueryKey[] = [queryKeys.vehicles.all];
      if (accountId) {
        keys.push(queryKeys.vehicles.list(accountId), queryKeys.dashboard.overview(accountId));
      }
      if (data?.id) {
        keys.push(queryKeys.vehicles.detail(data.id));
      }
      return keys;
    },
  });
}

export function useArchiveVehicle(accountId: string | null) {
  return useAppMutation({
    mutationFn: async (vehicleId: string) =>
      expectMutationResult(
        await archiveVehicle(accountId!, vehicleId),
        'Could not archive vehicle.',
      ),
    successMessage: 'Vehicle archived successfully.',
    errorMessage: 'Could not archive vehicle.',
    invalidateQueryKeys: ({ variables: vehicleId }) =>
      accountId
        ? [
            queryKeys.vehicles.all,
            queryKeys.vehicles.list(accountId),
            queryKeys.vehicles.detail(vehicleId),
            queryKeys.dashboard.overview(accountId),
          ]
        : [queryKeys.vehicles.all],
  });
}
