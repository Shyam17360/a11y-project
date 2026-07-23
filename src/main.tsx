import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

// BrowserRouter enables the per-page routing used to give each accessibility
// demo its own URL (see App.tsx) — needed so the a11y-devtools plugin can
// prove it audits only the current page's component, not the whole app.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
