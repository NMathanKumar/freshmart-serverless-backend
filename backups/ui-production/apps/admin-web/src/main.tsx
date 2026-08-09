import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppErrorBoundary, AppToaster, ThemeProvider } from '@freshmart/design-system';
import { AppRouter } from './app/router.js';
import { store } from './app/store.js';
import '@freshmart/design-system/styles.css';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Admin application root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <ThemeProvider defaultTheme="light">
          <AppRouter />
          <AppToaster />
        </ThemeProvider>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>
);
