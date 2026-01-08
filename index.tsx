
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initMonitoring } from './src/utils/logger';

initMonitoring();

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
