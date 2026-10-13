import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

function loadModule(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  new Function('exports', outputText)(exports);
  return exports;
}

const { contentProblems, idError } = loadModule('../src/lib/content/validation.ts');
const { FALLBACK_CONTENT } = loadModule('../src/lib/content/fallback-content.ts');
const draft = (kind) => structuredClone(FALLBACK_CONTENT.find((doc) => doc.kind === kind).value);
const check = (kind, edit) => {
  const value = draft(kind);
  edit(value);
  return contentProblems(kind, value).join('\n');
};

test('all bundled documents pass the client bounds checks', () => {
  for (const document of FALLBACK_CONTENT) assert.deepEqual(contentProblems(document.kind, document.value), [], document.key);
});

test('rejects unsupported schema versions and invalid IDs using the backend grammar', () => {
  assert.match(check('page', (page) => { page.schemaVersion = 2; }), /schemaVersion/);
  assert.equal(idError(`a${'b'.repeat(79)}`), null);
  for (const id of ['1-start', 'Uppercase', 'under_score', 'a'.repeat(81)]) assert.ok(idError(id), id);
  assert.match(check('page', (page) => { page.sections[0].id = '1-start'; }), /sections\[1\]\.id/);
});

test('rejects duplicate section and catalog IDs within their actual scopes', () => {
  assert.match(check('page', (page) => { page.sections[1].id = page.sections[0].id; }), /duplicate ID/);
  for (const key of ['categories', 'vehicleSizes', 'addons', 'ceramicServices']) {
    assert.match(check('catalog', (catalog) => { catalog[key].push(structuredClone(catalog[key][0])); }), /duplicate ID/, key);
  }
  assert.match(check('catalog', (catalog) => {
    const packages = catalog.categories[0].packages;
    packages.push(structuredClone(packages[0]));
  }), /packages.*duplicate ID/);
  // Package IDs can repeat in different categories.
  assert.doesNotMatch(check('catalog', (catalog) => {
    catalog.categories[1].packages[0].id = catalog.categories[0].packages[0].id;
  }), /duplicate ID/);
});

test('enforces each DTO array cap and required collections', () => {
  for (const [kind, key, max] of [
    ['page', 'sections', 50], ['site', 'navigation', 20], ['site', 'footerLinks', 20], ['site', 'socialLinks', 20],
    ['catalog', 'categories', 20], ['catalog', 'vehicleSizes', 20], ['catalog', 'addons', 50], ['catalog', 'ceramicServices', 30],
  ]) {
    assert.match(check(kind, (value) => {
      const item = value[key][0];
      value[key] = Array.from({ length: max + 1 }, (_, index) => ({ ...item, id: `item-${index}` }));
    }), new RegExp(`${key}: use .*${max} items`), key);
  }
  assert.match(check('catalog', (value) => { value.categories[0].packages = []; }), /packages: use 1 to 30/);
  assert.match(check('catalog', (value) => { value.categories[0].packages[0].features = Array(51).fill('Feature'); }), /features: use up to 50/);
  assert.match(check('page', (value) => { value.sections = []; }), /sections: use 1 to 50/);
});

test('reports DTO text and numeric bounds with the offending path', () => {
  assert.match(check('site', (value) => { value.business.phoneDisplay = 'x'.repeat(81); }), /business.phoneDisplay: use up to 80/);
  assert.match(check('page', (value) => { value.metadata.title = 'x'.repeat(201); }), /metadata.title: use up to 200/);
  assert.match(check('catalog', (value) => { value.categories[0].packages[0].features = ['x'.repeat(1001)]; }), /features\[1\]: use up to 1000/);
  assert.match(check('catalog', (value) => { value.addons[0].priceCents = 100000001; }), /priceCents: use whole cents/);
  assert.match(check('catalog', (value) => { value.categories[0].packages[0].duration.minMinutes = 10081; }), /minMinutes: use whole minutes/);
  // class-validator counts surrogate pairs and presentation selectors as one character.
  assert.doesNotMatch(check('page', (value) => { value.metadata.title = '😀'.repeat(200); }), /metadata.title/);
  assert.doesNotMatch(check('page', (value) => { value.metadata.title = '☀️'.repeat(200); }), /metadata.title/);
});

test('free-form content uses a ten-level budget rooted at section.fields', () => {
  const nested = (levels) => Array.from({ length: levels }).reduce((child) => ({ nested: child }), 'leaf');
  assert.deepEqual(check('page', (value) => { value.sections[0].fields = nested(10); }), '');
  assert.match(check('page', (value) => { value.sections[0].fields = nested(11); }), /10 levels/);
  assert.match(check('site', (value) => { value.copy = nested(11); }), /10 levels/);
});

test('free-form text counts Unicode code points and caps objects, lists, and document bytes', () => {
  assert.deepEqual(check('page', (value) => { value.sections[0].fields = { body: '😀'.repeat(10000) }; }), '');
  assert.match(check('page', (value) => { value.sections[0].fields = { body: '😀'.repeat(10001) }; }), /10000 characters/);
  assert.match(check('page', (value) => { value.sections[0].fields = Object.fromEntries(Array.from({ length: 101 }, (_, index) => [`field${index}`, null])); }), /100 fields/);
  assert.match(check('page', (value) => { value.sections[0].fields = { items: Array(101).fill(null) }; }), /100 items/);
  assert.match(check('page', (value) => { value.sections[0].fields = { body: Array(9).fill('x'.repeat(10000)) }; }), /80000 bytes/);
  assert.match(check('page', (value) => { value.sections[0].fields = { constructor: 'unsafe' }; }), /valid field name/);
  assert.match(check('page', (value) => { value.sections[0].fields = { imageUrl: 'javascript:alert(1)' }; }), /allowed link/);
  assert.match(check('page', (value) => { value.sections[0].fields = { href: `/${'😀'.repeat(1024)}` }; }), /allowed link/);
});
