import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);

// Exercise the actual TypeScript modules without loading React or Next.
function loadModule(path, modules = {}, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  });
  const exports = {};
  const names = Object.keys(globals);
  new Function('require', 'exports', ...names, outputText)((name) => {
    assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`);
    return modules[name];
  }, exports, ...names.map((name) => globals[name]));
  return exports;
}

const { FALLBACK_CONTENT } = loadModule('../src/lib/content/fallback-content.ts');
const { INITIAL_CONTENT_V1 } = loadModule('../../backend/src/content/content-seed.v1.ts');
const catalogModule = loadModule('../src/lib/content/catalog.ts');
const fields = loadModule('../src/lib/content/fields.ts');
const validation = loadModule('../src/lib/content/validation.ts');
const catalog = FALLBACK_CONTENT.find((document) => document.key === 'catalog').value;
const backendRequire = createRequire(new URL('../../backend/package.json', import.meta.url));
const { ContentService } = loadModule('../../backend/src/content/content.service.ts', {
  '@nestjs/common': backendRequire('@nestjs/common'),
  'node:crypto': require('node:crypto'),
  typeorm: {},
  './dto/content.dto': {},
  './entities/content-document.entity': {},
  './entities/content-revision.entity': {},
  './content.validation': {},
});

const selection = (changes = {}) => ({
  categoryId: 'combo',
  packageId: 'platinum',
  vehicleSizeId: 'car',
  addonIds: [],
  ...changes,
});

test('offline fallback content matches the backend seed exactly', () => {
  assert.deepEqual(FALLBACK_CONTENT, INITIAL_CONTENT_V1);
});

test('quotes the documented example the same way as the backend', () => {
  const quote = catalogModule.calculateQuote(catalog, selection({
    vehicleSizeId: 'large-suv',
    addonIds: ['pet-hair-removal'],
    coatingId: 'graphene-coating',
    correctionId: 'paint-correction-2',
  }));
  assert.equal(quote.totalCents, 142500);
  assert.equal(quote.calLink, 'quikspitboise/full-detail');
  assert.deepEqual(quote.duration, { minMinutes: 480, maxMinutes: 780 });
  assert.equal(quote.lineItems.find((line) => line.id === 'paint-correction-2').amountCents, 20000);
});

test('charges a standalone correction in full and adds its time', () => {
  const quote = catalogModule.calculateQuote(catalog, selection({ correctionId: 'paint-correction-2' }));
  assert.equal(quote.totalCents, 30000 + 65000);
  assert.deepEqual(quote.duration, { minMinutes: 300, maxMinutes: 480 });
});

test('counts correction time with a coating unless that exact correction is included', () => {
  const coating = { coatingId: 'graphene-coating' };
  const included = catalogModule.calculateQuote(catalog, selection({ ...coating, correctionId: 'paint-correction-1' }));
  assert.deepEqual(included.duration, { minMinutes: 360, maxMinutes: 540 });
  assert.equal(included.lineItems.at(-1).amountCents, 0);

  const noIncludedCorrection = structuredClone(catalog);
  delete noIncludedCorrection.ceramicServices.find((item) => item.id === coating.coatingId).includedCorrectionId;
  const quote = catalogModule.calculateQuote(noIncludedCorrection, selection({ ...coating, correctionId: 'paint-correction-2' }));
  assert.deepEqual(quote.duration, { minMinutes: 480, maxMinutes: 780 });
  assert.equal(quote.lineItems.at(-1).amountCents, 65000);
});

test('frontend and actual backend quote calculations agree across catalog selections and mutations', async () => {
  const service = new ContentService({});
  const changed = structuredClone(catalog);
  changed.categories[0].packages[0].basePriceCents += 1234;
  changed.vehicleSizes[0].surchargeCents += 250;
  changed.addons[0].enabled = false;
  const coating = changed.ceramicServices.find((item) => item.kind === 'coating');
  delete coating.includedCorrectionId;
  coating.duration = { minMinutes: 17, maxMinutes: 49 };
  changed.ceramicServices.find((item) => item.kind === 'correction').duration = { minMinutes: 23, maxMinutes: 67 };
  const disabled = structuredClone(catalog);
  disabled.categories[0].enabled = false;
  disabled.vehicleSizes[0].enabled = false;
  disabled.ceramicServices[0].enabled = false;
  const cheaperUpgrade = structuredClone(catalog);
  cheaperUpgrade.ceramicServices.find((item) => item.id === 'paint-correction-2').priceCents = 100;

  for (const value of [catalog, changed, disabled, cheaperUpgrade]) {
    service.getPublic = async () => ({ value, revisionId: 'test-revision' });
    for (const category of value.categories) {
      for (const pkg of category.packages) {
        for (const size of value.vehicleSizes) {
          for (const coatingId of [undefined, 'graphene-coating', 'missing']) {
            for (const correctionId of [undefined, 'paint-correction-1', 'paint-correction-2', 'missing']) {
              const chosen = selection({ categoryId: category.id, packageId: pkg.id, vehicleSizeId: size.id, coatingId, correctionId });
              const frontend = catalogModule.calculateQuote(value, chosen);
              if (!frontend) {
                await assert.rejects(service.quote(chosen), (error) => error.getStatus() === 400, JSON.stringify(chosen));
              } else {
                const backend = await service.quote(chosen);
                for (const field of ['lineItems', 'totalCents', 'duration', 'calLink']) {
                  assert.deepEqual(frontend[field], backend[field], `${field}: ${JSON.stringify(chosen)}`);
                }
              }
            }
          }
        }
      }
    }
    for (const addonIds of [[], ...value.addons.map((item) => [item.id]), value.addons.map((item) => item.id), ['missing']]) {
      const chosen = selection({ addonIds });
      const frontend = catalogModule.calculateQuote(value, chosen);
      if (!frontend) await assert.rejects(service.quote(chosen), (error) => error.getStatus() === 400);
      else assert.deepEqual(frontend.lineItems, (await service.quote(chosen)).lineItems);
    }
  }
});

test('rejects disabled, unknown, and ineligible selections like the backend', () => {
  assert.equal(catalogModule.calculateQuote(catalog, selection({ addonIds: ['nope'] })), null);
  assert.equal(catalogModule.calculateQuote(catalog, selection({ packageId: 'gold', coatingId: 'graphene-coating' })), null);
  const disabled = structuredClone(catalog);
  disabled.addons[0].enabled = false;
  assert.equal(catalogModule.calculateQuote(disabled, selection({ addonIds: [disabled.addons[0].id] })), null);
  assert.ok(catalogModule.publicAddons(disabled).every((addon) => addon.enabled));
});

test('offers only correction upgrades with a coating, priced as the difference', () => {
  const coating = catalog.ceramicServices.find((service) => service.id === 'graphene-coating');
  const withCoating = catalogModule.correctionOptions(catalog, coating);
  assert.deepEqual(withCoating.map((option) => [option.service.id, option.amountCents]), [['paint-correction-2', 20000]]);
  const alone = catalogModule.correctionOptions(catalog, undefined);
  assert.deepEqual(alone.map((option) => [option.service.id, option.amountCents]), [
    ['paint-correction-1', 45000],
    ['paint-correction-2', 65000],
  ]);
});

test('normalizes selections when the package or coating changes', () => {
  const kept = catalogModule.normalizeSelection(catalog, selection({ coatingId: 'graphene-coating', correctionId: 'paint-correction-2' }));
  assert.equal(kept.correctionId, 'paint-correction-2');
  // Without the coating, the included correction is a valid standalone choice again.
  assert.equal(catalogModule.normalizeSelection(catalog, selection({ correctionId: 'paint-correction-1' })).correctionId, 'paint-correction-1');
  assert.equal(catalogModule.normalizeSelection(catalog, selection({ coatingId: 'graphene-coating', correctionId: 'paint-correction-1' })).correctionId, undefined);
  const ineligible = catalogModule.normalizeSelection(catalog, selection({ packageId: 'gold', coatingId: 'graphene-coating', addonIds: ['bio-clean', 'gone'] }));
  assert.equal(ineligible.coatingId, undefined);
  assert.deepEqual(ineligible.addonIds, ['bio-clean']);
});

test('derives shared price facts from the catalog', () => {
  assert.equal(catalogModule.surchargeRange(catalog), '$25 to $55');
  assert.equal(catalogModule.categoryFromPriceCents(catalog, 'interior'), 12500);
  assert.equal(catalogModule.serviceFromPriceCents(catalog, 'graphene-coating', true), 85000 + 15000);
  assert.equal(catalogModule.formatCents(142500), '$1,425');
  assert.equal(catalogModule.formatCents(1250), '$12.50');
  assert.equal(catalogModule.formatDuration({ minMinutes: 150, maxMinutes: 210 }), '2.5–3.5 hours');
});

test('fills only the known tokens and leaves other braces alone', () => {
  const text = 'SUVs cost {surchargeRange} more. A {depositAmount} deposit. {other}';
  assert.equal(
    fields.fillTokens(text, { surchargeRange: '$25 to $55', depositAmount: '$50' }),
    'SUVs cost $25 to $55 more. A $50 deposit. {other}',
  );
});

test('metadata follows editable SEO copy and business facts', () => {
  const metadata = loadModule('../src/lib/content/metadata.ts', {
    './catalog': catalogModule,
    './fields': fields,
    './types': loadModule('../src/lib/content/types.ts'),
  });
  const site = structuredClone(FALLBACK_CONTENT.find((document) => document.key === 'site').value);
  site.copy.seo = { keywords: ['updated keyword'] };
  site.business.name = 'Updated business';
  site.business.serviceArea = 'Updated service area';
  const snapshot = { site, catalog };
  assert.deepEqual(metadata.buildSiteMetadata(snapshot).keywords, ['updated keyword']);
  const data = metadata.buildLocalBusinessData(snapshot);
  assert.equal(data.name, 'Updated business');
  assert.equal(data.areaServed, 'Updated service area');
  assert.equal(data.hasOfferCatalog.name, 'Updated business services');
  assert.equal(data.geo, undefined);
  assert.equal(data.address, undefined);
});

test('client link checks agree with the backend rules', () => {
  for (const ok of ['/pricing', '#faq', 'https://example.com/a', 'mailto:a@b.co', 'tel:+12085551234']) {
    assert.equal(validation.isSafeContentLink(ok), true, ok);
  }
  for (const bad of ['', 'javascript:alert(1)', '//evil.example', 'http://example.com', 'https://u:p@example.com', '/a b', 'tel:555']) {
    assert.equal(validation.isSafeContentLink(bad), false, bad);
  }
  assert.equal(validation.makeId('Ceramic Wax!', ['ceramic-wax']), 'ceramic-wax-2');
  assert.equal(validation.makeId('3 Step Polish', []), 'step-polish');
});

test('formats class-validator errors into a readable message', () => {
  const message = validation.describeApiError({
    message: 'Invalid content document',
    errors: [{ property: 'business', children: [{ property: 'phone', constraints: { matches: 'phone must match' } }] }],
  }, 'fallback');
  assert.equal(message, 'Invalid content document: business.phone: phone must match');
});

test('content proxy forwards only known admin routes and refreshes caches after publishing', async () => {
  const { NextResponse } = require('next/server');
  const calls = [];
  const refreshed = [];
  const route = loadModule('../src/app/api/admin/content/[...path]/route.ts', {
    'next/server': { NextResponse },
    '@/lib/server/gallery-api': {
      proxyAdminRequest: async (_request, path, init) => {
        calls.push([init.method, path]);
        return NextResponse.json(path.endsWith('/publish') ? { document: {}, affectedPaths: ['/pricing'] } : { ok: true });
      },
    },
    '@/lib/server/content-revalidation': {
      refreshPublishedContent: (key, paths) => {
        refreshed.push([key, paths]);
        return { refreshed: true, paths };
      },
    },
  });
  const call = (method, path, search = '') =>
    route[method](new Request(`https://site.example/api/admin/content/${path.join('/')}${search}`, {
      method,
      ...(method === 'GET' ? {} : { body: '{}' }),
    }), { params: Promise.resolve({ path }) });

  assert.equal((await call('GET', ['documents', 'page:home'])).status, 200);
  assert.equal((await call('GET', ['documents', 'page:home', 'revisions'], '?page=2&limit=20')).status, 200);
  assert.equal((await call('PUT', ['documents', 'catalog', 'draft'])).status, 200);
  const published = await call('POST', ['documents', 'catalog', 'publish']);
  assert.deepEqual(await published.json(), { document: {}, affectedPaths: ['/pricing'], cache: { refreshed: true, paths: ['/pricing'] } });
  assert.deepEqual(calls, [
    ['GET', '/content/admin/documents/page%3Ahome'],
    ['GET', '/content/admin/documents/page%3Ahome/revisions?page=2&limit=20'],
    ['PUT', '/content/admin/documents/catalog/draft'],
    ['POST', '/content/admin/documents/catalog/publish'],
  ]);
  assert.deepEqual(refreshed, [['catalog', ['/pricing']]]);

  for (const [method, path] of [['GET', ['quote']], ['POST', ['documents', 'site', 'draft']], ['PUT', ['documents', 'site']], ['POST', ['documents', 'site', 'delete']], ['GET', ['documents', 'a', 'revisions', 'b', 'c']]]) {
    assert.equal((await call(method, path)).status, 404, `${method} ${path.join('/')}`);
  }
  assert.equal(calls.length, 4);
});

test('publishing refreshes affected pages, shared layouts, and sitemap membership', () => {
  const calls = [];
  const cache = loadModule('../src/lib/server/public-cache.ts', {
    'server-only': {},
    'next/cache': {
      revalidateTag: (...args) => calls.push(['tag', ...args]),
      revalidatePath: (...args) => calls.push(['path', ...args]),
    },
  });
  const { refreshPublishedContent } = loadModule('../src/lib/server/content-revalidation.ts', {
    'server-only': {},
    './content-api': { CONTENT_CACHE_TAG: 'site-content' },
    './public-cache': cache,
  });
  assert.deepEqual(refreshPublishedContent('page:pricing', ['/pricing', '/pricing']), { refreshed: true, paths: ['/pricing'] });
  assert.deepEqual(calls, [
    ['tag', 'site-content', { expire: 0 }],
    ['path', '/pricing'],
    ['path', '/sitemap.xml'],
  ]);
  calls.length = 0;
  refreshPublishedContent('catalog', ['/pricing', '/booking']);
  assert.deepEqual(calls.at(-1), ['path', '/', 'layout']);
});

test('cached and uncached booking settings use the same normalization and distinct fetch policies', async () => {
  const requests = [];
  const logs = [];
  let fail = false;
  const booking = loadModule('../src/lib/server/booking-settings-api.ts', {
    'server-only': {},
    '../backend-api': { buildBackendApiUrl: (path) => `https://backend.example/api${path}` },
    '../fetch-with-timeout': { createTimeoutSignal: () => new AbortController().signal },
    '../booking-settings': loadModule('../src/lib/booking-settings.ts'),
    './admin-auth': {},
  }, {
    fetch: async (...args) => {
      requests.push(args);
      if (fail) throw new Error('offline');
      return Response.json({ depositAmount: 12.345 });
    },
    console: { error: (...args) => logs.push(args) },
  });
  assert.deepEqual(await booking.fetchPublicBookingSettings(), { depositAmount: 12.35 });
  assert.deepEqual(await booking.fetchCachedBookingSettings(), { depositAmount: 12.35 });
  assert.equal(requests[0][1].cache, 'no-store');
  assert.equal(requests[0][1].next, undefined);
  assert.deepEqual(requests[1][1].next, { revalidate: 300, tags: ['booking-settings'] });
  assert.equal(requests[1][1].cache, undefined);
  fail = true;
  assert.deepEqual(await booking.fetchPublicBookingSettings(), { depositAmount: 0 });
  assert.deepEqual(await booking.fetchCachedBookingSettings(), { depositAmount: 0 });
  assert.match(logs[0][0], /uncached read/);
  assert.match(logs[1][0], /\(cached read\)/);
});
