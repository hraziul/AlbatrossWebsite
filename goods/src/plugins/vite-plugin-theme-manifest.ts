/**
 * vite-plugin-theme-manifest.ts
 *
 * Vite plugin that scans public/themes/ at build time (and on each dev-server
 * file-change) and writes public/themes/manifest.json containing two arrays:
 *   { landscape: string[], vertical: string[] }
 *
 * Filenames:
 *   landscape_*  → desktop / tablet pool
 *   vertical_*   → mobile pool
 *
 * Adding or removing a file in public/themes/ automatically regenerates the
 * manifest on the next build or HMR update — no code changes required.
 */

import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function generateManifest(themesDir: string, base: string): void {
  let files: string[] = [];
  try {
    files = fs.readdirSync(themesDir).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTS.has(ext) && !f.startsWith('.');
    });
  } catch {
    // themes/ directory may not exist yet
    return;
  }

  // `base` is "/goods/" in production, "/" in dev (see vite.config.ts) — these
  // paths are written as plain strings into a JSON file, not run through
  // Vite's asset pipeline, so they need the prefix applied manually here.
  const prefix = base.endsWith('/') ? base : `${base}/`;

  const landscape = files
    .filter(f => f.startsWith('landscape_') || f.startsWith('lanscape_')) // handle the typo too
    .map(f => `${prefix}themes/${f}`);

  const vertical = files
    .filter(f => f.startsWith('vertical_'))
    .map(f => `${prefix}themes/${f}`);

  const manifest = { landscape, vertical };
  const manifestPath = path.join(themesDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[theme-manifest] Generated: ${landscape.length} landscape, ${vertical.length} vertical`);
}

export function themeManifestPlugin(): Plugin {
  let themesDir: string;
  let base = '/';

  return {
    name: 'vite-theme-manifest',
    configResolved(config) {
      themesDir = path.join(config.root, 'public', 'themes');
      base = config.base;
      generateManifest(themesDir, base);
    },
    buildStart() {
      generateManifest(themesDir, base);
    },
    configureServer(server) {
      // Regenerate manifest when files inside public/themes/ change
      server.watcher.on('add', (filePath) => {
        if (filePath.includes(`${path.sep}themes${path.sep}`)) generateManifest(themesDir, base);
      });
      server.watcher.on('unlink', (filePath) => {
        if (filePath.includes(`${path.sep}themes${path.sep}`)) generateManifest(themesDir, base);
      });
    },
  };
}
