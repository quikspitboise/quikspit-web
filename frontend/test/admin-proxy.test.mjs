import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { NextResponse } = require('next/server');
const source = readFileSync(new URL('../src/lib/server/gallery-api.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

// Load the actual server helper with isolated auth and network dependencies.
// This avoids starting Next or reaching Clerk and the deployed backend.
function fixture({ authenticated = true, upstream = async () => new Response('{}') } = {}) {
  const requests = [];
  const logs = [];
  const modules = {
    'server-only': {},
    'next/server': { NextResponse },
    '@/data/gallery': { GALLERY_ITEMS: [] },
    '../backend-api': { buildBackendApiUrl: (path) => `https://backend.example/api${path}` },
    '../fetch-with-timeout': { createTimeoutSignal: () => new AbortController().signal },
    './admin-auth': {
      getAdminApiAuth: async () => authenticated ? { userId: 'test-admin', token: 'test-token' } : null,
    },
  };
  const exports = {};
  new Function('require', 'exports', 'fetch', 'console', outputText)(
    (name) => {
      assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`);
      return modules[name];
    },
    exports,
    async (...args) => { requests.push(args); return upstream(...args); },
    { error: (...args) => logs.push(args) },
  );
  return { proxy: exports.proxyAdminRequest, requests, logs };
}

function request(headers = { Origin: 'https://site.example' }) {
  return new Request('https://site.example/api/admin/gallery', { method: 'POST', headers });
}

test('rejects missing/cross-site origins and unauthorised users before forwarding', async () => {
  for (const headers of [{}, { Origin: 'https://other.example' }, { Origin: 'null' }]) {
    const { proxy, requests } = fixture();
    assert.equal((await proxy(request(headers), '/gallery/admin/items')).status, 403);
    assert.equal(requests.length, 0);
  }
  const { proxy, requests } = fixture({ authenticated: false });
  assert.equal((await proxy(request(), '/gallery/admin/items')).status, 404);
  assert.equal(requests.length, 0);
});

test('supports same-origin referers and forwards server-side auth without caching', async () => {
  const { proxy, requests } = fixture();
  const response = await proxy(request({ Referer: 'https://site.example/admin' }), '/gallery/admin/items');
  assert.equal(response.status, 200);
  assert.equal(requests[0][1].headers.get('Authorization'), 'Bearer test-token');
  assert.equal(requests[0][1].cache, 'no-store');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('does not expose upstream 5xx content in responses or logs', async () => {
  const secret = 'private database connection details';
  const { proxy, logs } = fixture({ upstream: async () => new Response(secret, { status: 500 }) });
  const response = await proxy(request(), '/gallery/admin/items');
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private database/);
  assert.doesNotMatch(JSON.stringify(logs), /private database/);
});

test('maps network failures and timeouts to JSON gateway errors', async () => {
  for (const [name, status] of [['TypeError', 502], ['TimeoutError', 504], ['AbortError', 504]]) {
    const error = new Error('internal connection details');
    error.name = name;
    const { proxy } = fixture({ upstream: async () => { throw error; } });
    const response = await proxy(request(), '/settings/admin/booking');
    assert.equal(response.status, status);
    assert.equal(typeof (await response.json()).message, 'string');
  }
});

test('preserves bodyless success and rate-limit retry information', async () => {
  const empty = fixture({ upstream: async () => new Response(null, { status: 204 }) });
  const response = await empty.proxy(request(), '/gallery/admin/items');
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');

  const limited = fixture({ upstream: async () => Response.json(
    { message: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } },
  ) });
  const rateLimit = await limited.proxy(request(), '/gallery/admin/items');
  assert.equal(rateLimit.status, 429);
  assert.equal(rateLimit.headers.get('retry-after'), '60');
  assert.deepEqual(await rateLimit.json(), { message: 'Too many requests' });
});
