export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

export function expectMutationResult<T>(
  result: T | null | undefined | false,
  message: string,
): T {
  if (result == null || result === false) {
    throw new Error(message);
  }

  return result;
}
