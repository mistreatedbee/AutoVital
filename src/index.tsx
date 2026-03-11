import './index.css';
import React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { AccountProvider } from './account/AccountProvider';
import { ToastProvider } from './components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

render(
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AuthProvider>
        <AccountProvider>
          <App />
        </AccountProvider>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>,
  document.getElementById('root'),
);