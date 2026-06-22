import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyFetchPatch } from './lib/clientDbFallback.ts';

// Apply static cloud deployment fetch isolation to prevent console 404s
applyFetchPatch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
