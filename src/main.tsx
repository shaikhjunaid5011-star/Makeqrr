// Ensure window.fetch has both getter and setter in iframe environments
try {
  if (typeof window !== 'undefined') {
    const curFetch = window.fetch;
    let wrappedFetch = curFetch;
    try {
      Object.defineProperty(window, 'fetch', {
        get: () => wrappedFetch,
        set: (f) => { wrappedFetch = f; },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }
} catch (_) {}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './lib/theme-context.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

