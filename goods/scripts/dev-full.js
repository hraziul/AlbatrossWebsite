/**
 * dev-full.js
 *
 * Checkout needs two processes running at once in local dev: the Vite
 * frontend (`npm run dev`) and the Express backend (`node server.js`), which
 * the frontend proxies /api/* requests to. Forgetting to start the second
 * one is the #1 cause of "Could not reach the payment server" — this script
 * starts both together, with prefixed output, so there's only one command
 * to remember: `npm run dev:full`.
 */
import { spawn } from 'child_process';

const procs = [
  { name: 'vite', color: '\x1b[36m', cmd: 'npm', args: ['run', 'dev'] },
  { name: 'api ', color: '\x1b[35m', cmd: 'node', args: ['server.js'] },
];
const RESET = '\x1b[0m';

const children = procs.map(({ name, color, cmd, args }) => {
  const child = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'] });

  const prefix = (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
      process.stdout.write(`${color}[${name}]${RESET} ${line}\n`);
    });
  };
  child.stdout.on('data', prefix);
  child.stderr.on('data', prefix);
  child.on('exit', (code) => {
    console.log(`${color}[${name}]${RESET} exited (code ${code})`);
  });

  return child;
});

const shutdown = () => {
  children.forEach(child => child.kill('SIGTERM'));
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
