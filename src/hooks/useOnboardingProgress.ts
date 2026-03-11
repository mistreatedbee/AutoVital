import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { fetchOnboardingProgress } from '../services/onboarding';

export function useOnboardingProgress() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['onboarding', user?.id],
    queryFn: () => fetchOnboardingProgress(user!.id),
    enabled: !!user?.id,
  });

  return {
    progress: data ?? null,
    loading: isLoading,
    refetch,
    isComplete: Boolean(data?.completedAt),
  };
}
