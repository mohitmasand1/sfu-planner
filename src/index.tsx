import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalsProvider } from './hooks/ModalsContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <App />
        </ModalsProvider>
      </QueryClientProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>,
);
