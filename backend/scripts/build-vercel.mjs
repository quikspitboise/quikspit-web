import { spawnSync } from 'node:child_process';

function run(script, env = process.env) {
  const result = spawnSync('corepack', ['pnpm', script], {
    stdio: 'inherit',
    env,
  });
  if (result.error) {
    console.error(`Could not start ${script}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Compile first so a broken build never applies its database changes.
run('build');

if (process.env.VERCEL_ENV === 'production') {
  console.log('Applying pending production database migrations.');
  run('migration:run', { ...process.env, NODE_ENV: 'production' });
} else {
  console.log('Skipping production migrations for this environment.');
}
