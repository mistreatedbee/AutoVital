import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import { fetchBillingOverview } from '../../services/billing';

export function useBillingOverview(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.billing.subscription(accountId ?? ''),
    queryFn: () => fetchBillingOverview(accountId!),
    enabled: !!accountId,
  });
}
