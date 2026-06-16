import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason);
    if (
      msg &&
      (msg.includes('WebSocket') ||
       msg.includes('websocket') ||
       msg.includes('WebSocket closed without opened.'))
    ) {
      event.preventDefault();
      console.debug('Suppressed benign Vite HMR websocket unhandled rejection:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg &&
      (msg.includes('WebSocket') ||
       msg.includes('websocket') ||
       msg.includes('WebSocket closed without opened.'))
    ) {
      event.preventDefault();
      console.debug('Suppressed benign Vite HMR websocket connection error:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
