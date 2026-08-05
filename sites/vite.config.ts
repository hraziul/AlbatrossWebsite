import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  return {
    // Deployed at https://albatrossamaze.com/sites — same pattern as
    // goods/vite.config.ts: prefix asset URLs in production, keep root-served
    // for local `vite dev` so `npm run dev` is unaffected.
    base: command === 'build' ? '/sites/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
