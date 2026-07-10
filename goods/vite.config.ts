import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { themeManifestPlugin } from './src/plugins/vite-plugin-theme-manifest';

export default defineConfig(({ command }) => {
  return {
    // Deployed at https://albatrossamaze.com/goods — asset URLs need the
    // /goods/ prefix in the production build. Left as "/" for `vite dev` so
    // local dev (npm run dev) is unaffected and still serves from the root.
    base: command === 'build' ? '/goods/' : '/',
    plugins: [react(), tailwindcss(), themeManifestPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:5005',
          changeOrigin: true,
          // The frontend and the Express backend (server.js) are two separate
          // processes in local dev — this is the #1 cause of "checkout is
          // broken" confusion when only `npm run dev` was started. Surface it
          // loudly in the terminal the moment a proxied request can't connect,
          // rather than leaving it as a silent browser-only fetch failure.
          configure: (proxy) => {
            proxy.on('error', (err, req) => {
              if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
                console.error(`\n⚠️  [vite proxy] Could not reach the backend for ${req.url} (http://localhost:5005 refused the connection).`);
                console.error('    The Express backend isn\'t running. Start it in a separate terminal with `node server.js` (or `npm run start`) alongside `npm run dev`.\n');
              } else {
                console.error(`\n⚠️  [vite proxy] Error proxying ${req.url}:`, err.message, '\n');
              }
            });
          }
        }
      }
    },
  };
});
