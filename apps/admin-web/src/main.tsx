import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { AppErrorBoundary, AppToaster, ThemeProvider } from '@freshmart/design-system';
import { AppRouter } from './app/router.js';
import { AuthProvider } from './context/AuthContext.js';
import { store } from './app/store.js';
import { parseApiError } from './lib/api-error.js';
import { Logger } from './shared/utils/logger.js';
import { toast } from 'sonner';
import '@freshmart/design-system/styles.css';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Admin application root was not found.');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const err = parseApiError(error);
      if (err.code !== 'REQUEST_ABORTED') {
        Logger.error(`[Query Error]: ${err.message}`, err);
      }
      if (err.statusCode === 401) {
        queryClient.clear();
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const err = parseApiError(error);
      Logger.error(`[Mutation Error]: ${err.message}`, err);
      toast.error('Operation Failed', {
        description: err.message,
      });
      if (err.statusCode === 401) {
        queryClient.clear();
      }
    },
    onSuccess: (_, _variables, _context, mutation) => {
      // Allow individual mutations to opt-out of standard toast
      if (mutation.meta?.hideToast) return;
      
      const successMessage = (mutation.meta?.successMessage as string) || 'Operation completed successfully.';
      toast.success('Success', {
        description: successMessage,
      });
    }
  }),
});

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light">
            <AuthProvider>
              <AppRouter />
              <AppToaster />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>
);
