import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import a11yDevtools from 'vite-plugin-a11y-devtools';

// This is the one-line change every app on a shared build config needs to
// add — no other source changes required. a11yDevtools() only does anything
// during `vite dev`; it's a no-op for `vite build`. See
// packages/vite-plugin-a11y-devtools for the plugin itself.
export default defineConfig({
  plugins: [react(), a11yDevtools()],
});
