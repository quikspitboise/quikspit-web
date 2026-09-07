import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

function loadModule(path, modules = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  new Function('require', 'exports', outputText)((name) => {
    assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`);
    return modules[name];
  }, exports);
  return exports;
}

test('reviews cache successful data by TTL and retries an unavailable provider', async () => {
  const reviews = loadModule('../src/lib/reviews.ts', {
    './backend-api': { buildBackendApiUrl: (path) => `https://backend.example${path}` },
    './fetch-with-timeout': { createTimeoutSignal: () => new AbortController().signal },
  });
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = 10_000;
  let requests = 0;
  const data = {
    available: true,
    rating: 4.8,
    totalReviews: 12,
    reviews: [],
    reviewLink: 'https://example.com/reviews',
  };

  Date.now = () => now;
  reviews.clearReviewsCache();
  globalThis.fetch = async () => {
    requests += 1;
    return Response.json(data);
  };

  assert.deepEqual(await reviews.fetchReviews(), data);
  assert.deepEqual(await reviews.fetchReviews(), data);
  assert.equal(requests, 1);

  now += reviews.REVIEWS_CACHE_TTL_MS + 1;
  assert.deepEqual(await reviews.fetchReviews(), data);
  assert.equal(requests, 2);

  reviews.clearReviewsCache();
  globalThis.fetch = async () => {
    requests += 1;
    if (requests === 3) throw new Error('temporary outage');
    return Response.json(data);
  };
  const unavailable = await reviews.fetchReviews();
  assert.equal(unavailable.available, false);
  const requestCountAfterFailure = requests;
  now += reviews.REVIEWS_RETRY_DELAY_MS - 1;
  assert.equal((await reviews.fetchReviews()).available, false);
  assert.equal(requests, requestCountAfterFailure);

  now += 2;
  assert.deepEqual(await reviews.fetchReviews(), data);
  assert.equal(requests, requestCountAfterFailure + 1);

  reviews.clearReviewsCache();
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
});

test('provider scripts share one promise and one DOM script', async () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const scripts = [];
  const document = {
    querySelector: () => scripts.find((script) => script.dataset['data-quikspit-provider']),
    createElement: () => {
      const listeners = new Map();
      const script = {
        dataset: {},
        addEventListener(type, listener) { listeners.set(type, listener); },
        removeEventListener(type) { listeners.delete(type); },
        setAttribute(name, value) { this.dataset[name] = value; },
        dispatch(type) { listeners.get(type)?.(); },
        parentNode: null,
      };
      return script;
    },
    head: {
      appendChild(script) {
        scripts.push(script);
        script.parentNode = this;
        queueMicrotask(() => script.dispatch('load'));
      },
      removeChild(script) {
        const index = scripts.indexOf(script);
        if (index !== -1) scripts.splice(index, 1);
      },
    },
  };
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.document = document;
  const provider = loadModule('../src/lib/provider-script.ts');
  provider.clearProviderScriptCache();

  const first = provider.loadProviderScript('instagram');
  const second = provider.loadProviderScript('instagram');
  assert.equal(scripts.length, 1);
  await Promise.all([first, second]);
  assert.equal(scripts[0].dataset.quikspitLoaded, 'true');

  provider.clearProviderScriptCache();
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});

test('booking params stay parseable without importing the scheduling embed', () => {
  const { parseBookingParams } = loadModule('../src/lib/booking-params.ts');
  const selection = parseBookingParams(new URLSearchParams(
    'category=combo&tier=gold&size=suv&total=240&addons=Pet%20Hair',
  ));
  assert.equal(selection.category, 'combo');
  assert.equal(selection.total, 240);
  assert.equal(parseBookingParams(new URLSearchParams('category=combo')), null);
});

test('upload validation rejects unsupported and oversized files before XHR', () => {
  const { assertImageFile, MAX_UPLOAD_BYTES } = loadModule('../src/lib/cloudinary-upload.ts');
  assert.equal(assertImageFile(new File(['data'], 'car.jpg', { type: 'image/jpeg' }), 'Image').name, 'car.jpg');
  assert.throws(
    () => assertImageFile(new File(['data'], 'car.txt', { type: 'text/plain' }), 'Image'),
    /must be a HEIC, JPEG, PNG, or WebP image/,
  );
  assert.throws(
    () => assertImageFile(new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], 'car.jpg', { type: 'image/jpeg' }), 'Image'),
    /10 MB or smaller/,
  );
});
