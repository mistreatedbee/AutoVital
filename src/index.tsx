import './index.css';
import React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';

render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root'),
);