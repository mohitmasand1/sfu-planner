import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModalsProvider } from './hooks/ModalsContext';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ModalsProvider>
        <App />
      </ModalsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
