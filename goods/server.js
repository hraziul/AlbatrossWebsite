import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app, logConfigStatus } from './appCore.js';

/**
 * server.js
 *
 * Traditional-hosting entry point (local dev via `npm run dev:full` / `npm
 * run start`, or any plain Node host). All actual route logic lives in
 * appCore.js — this file only adds what a traditional single-process host
 * needs on top: serving the built frontend and starting the listener.
 * The Netlify Function entry (netlify/functions/api.js) uses the same
 * appCore.js but skips this file entirely, since Netlify's CDN already
 * serves the built goods/ frontend directly.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5005;

// Serve built assets
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Albatross Server listening on http://localhost:${PORT}`);
  console.log(` Mode: Production (Serving dist/)`);
  console.log(`======================================================`);
  logConfigStatus();
  console.log(`======================================================\n`);
});
