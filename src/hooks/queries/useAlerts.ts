import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  fetchUserAlerts,
  fetchAlertPreferences,
  updateAlertStatus,
  upsertAlertPreference,
} from '../../services/alerts';
import { useAppMutation } from '../useAppMutation';
import { expectMutationResult } from '../../lib/mutations';

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
  return useAppMutation({
    mutationFn: async ({
      alertId,
      status,
    }: {
      alertId: string | number;
      status: 'dismissed' | 'resolved';
    }) => {
      await updateAlertStatus(alertId, status);
      return true;
    },
    successMessage: ({ variables }) =>
      variables.status === 'resolved'
        ? 'Alert marked as resolved.'
        : 'Alert dismissed.',
    errorMessage: 'Could not update the alert.',
    invalidateQueryKeys: accountId
      ? [queryKeys.alerts.list(accountId), queryKeys.dashboard.overview(accountId)]
      : [queryKeys.alerts.all],
  });
}

export function useUpsertAlertPreference(
  accountId: string | null,
  options?: { successMessage?: string | false },
) {
  return useAppMutation({
    mutationFn: async (input: Parameters<typeof upsertAlertPreference>[0]) =>
      expectMutationResult(
        await upsertAlertPreference(input),
        'Could not update reminder settings.',
      ),
    successMessage:
      options?.successMessage === false
        ? undefined
        : options?.successMessage ?? 'Reminder settings updated successfully.',
    errorMessage: 'Could not update reminder settings.',
    invalidateQueryKeys: accountId
      ? [
          queryKeys.alerts.list(accountId),
          queryKeys.alerts.preferences(accountId),
          queryKeys.dashboard.overview(accountId),
        ]
      : [queryKeys.alerts.all],
  });
}
