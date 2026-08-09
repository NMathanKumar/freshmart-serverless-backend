export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) return undefined;
  const data = error.data;
  if (!data || typeof data !== 'object') return 'We could not complete your request. Please try again.';
  if ('detail' in data && typeof data.detail === 'string') return data.detail;
  if ('message' in data && typeof data.message === 'string') return data.message;
  return 'We could not complete your request. Please try again.';
};
