import './index.css';
import React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { AccountProvider } from './account/AccountProvider';
import { ToastProvider } from './components/ui/Toast';

render(
  <ToastProvider>
    <AuthProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </AuthProvider>
  </ToastProvider>,
  document.getElementById('root'),
);