import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchDashboardOverview } from '../../services/dashboardOverview';

export function useDashboardOverview(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(accountId ?? ''),
    queryFn: () => fetchDashboardOverview(accountId!),
    enabled: !!accountId,
  });
}
