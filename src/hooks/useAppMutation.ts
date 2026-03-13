import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from '../components/ui/Toast';
import { getErrorMessage } from '../lib/mutations';

type MessageResolver<TData, TVariables> =
  | string
  | ((args: { data: TData; variables: TVariables }) => string);

type ErrorMessageResolver<TVariables> =
  | string
  | ((args: { error: unknown; variables: TVariables }) => string);

interface UseAppMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage?: MessageResolver<TData, TVariables>;
  errorMessage: ErrorMessageResolver<TVariables>;
  invalidateQueryKeys?: QueryKey[] | ((args: { data: TData; variables: TVariables }) => QueryKey[]);
}

export function useAppMutation<TData, TVariables>({
  mutationFn,
  successMessage,
  errorMessage,
  invalidateQueryKeys,
}: UseAppMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: async (data, variables) => {
      const keys =
        typeof invalidateQueryKeys === 'function'
          ? invalidateQueryKeys({ data, variables })
          : invalidateQueryKeys ?? [];

      await Promise.all(
        keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      if (successMessage) {
        toast({
          variant: 'success',
          description:
            typeof successMessage === 'function'
              ? successMessage({ data, variables })
              : successMessage,
        });
      }
    },
    onError: (error, variables) => {
      const fallback =
        typeof errorMessage === 'function'
          ? errorMessage({ error, variables })
          : errorMessage;

      toast({
        variant: 'destructive',
        description: getErrorMessage(error, fallback),
      });
    },
  });
}
