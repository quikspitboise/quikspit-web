import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const buildScript = fileURLToPath(
  new URL('../scripts/build-vercel.mjs', import.meta.url),
);

function build(environment, failCommand) {
  const directory = mkdtempSync(join(tmpdir(), 'quikspit-build-'));
  const logPath = join(directory, 'commands.json');
  // Isolate command execution while exercising the real deployment script.
  writeFileSync(
    join(directory, 'corepack'),
    `#!/usr/bin/env node
const fs = require('node:fs');
const path = process.env.COMMAND_LOG;
const entries = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : [];
entries.push({ args: process.argv.slice(2), nodeEnv: process.env.NODE_ENV });
fs.writeFileSync(path, JSON.stringify(entries));
if (process.argv[3] === process.env.FAIL_COMMAND) process.exit(7);
`,
    { mode: 0o755 },
  );
  try {
    const result = spawnSync(process.execPath, [buildScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}${delimiter}${process.env.PATH}`,
        VERCEL_ENV: environment,
        NODE_ENV: 'test',
        FAIL_COMMAND: failCommand ?? '',
        COMMAND_LOG: logPath,
      },
    });
    assert.equal(result.error, undefined);
    return {
      status: result.status,
      commands: JSON.parse(readFileSync(logPath, 'utf8')),
    };
  } finally {
    rmSync(directory, { recursive: true });
  }
}

test('production compiles before running migrations with production database settings', () => {
  const result = build('production');
  assert.equal(result.status, 0);
  assert.deepEqual(
    result.commands.map(({ args }) => args),
    [
      ['pnpm', 'build'],
      ['pnpm', 'migration:run'],
    ],
  );
  assert.equal(result.commands[1].nodeEnv, 'production');
});

test('preview and local builds do not migrate a database', () => {
  for (const environment of ['preview', 'development', '']) {
    const result = build(environment);
    assert.equal(result.status, 0);
    assert.deepEqual(
      result.commands.map(({ args }) => args),
      [['pnpm', 'build']],
    );
  }
});

test('compilation failures prevent migrations and migration failures fail deployment', () => {
  const compileFailure = build('production', 'build');
  assert.equal(compileFailure.status, 7);
  assert.equal(compileFailure.commands.length, 1);
  const migrationFailure = build('production', 'migration:run');
  assert.equal(migrationFailure.status, 7);
  assert.equal(migrationFailure.commands.length, 2);
});
