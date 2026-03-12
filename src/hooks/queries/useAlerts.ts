import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchUserAlerts,
  fetchAlertPreferences,
  updateAlertStatus,
  upsertAlertPreference,
} from '../../services/alerts';

export function useAlertsAndPreferences(accountId: string | null, userId: string | null) {
  return useQuery({
    queryKey: queryKeys.alerts.list(accountId ?? ''),
    queryFn: async () => {
      const [alerts, preferences] = await Promise.all([
        fetchUserAlerts(accountId!),
        fetchAlertPreferences(userId, accountId!),
      ]);
      return { alerts, preferences };
    },
    enabled: !!accountId,
  });
}

export function useUpdateAlertStatus(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string | number; status: 'dismissed' | 'resolved' }) =>
      updateAlertStatus(alertId, status),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.list(accountId) });
      }
    },
  });
}

export function useUpsertAlertPreference(accountId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof upsertAlertPreference>[0]) =>
      upsertAlertPreference(input),
    onSuccess: () => {
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.list(accountId) });
      }
    },
  });
}
