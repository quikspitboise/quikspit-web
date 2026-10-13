import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { chromium } from '@playwright/test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const sources = {};
const packageSource = (name, file) => readFileSync(join(dirname(require.resolve(name)), 'cjs', file), 'utf8');
sources.react = packageSource('react', 'react.development.js');
sources['react/jsx-runtime'] = packageSource('react', 'react-jsx-runtime.development.js');
sources['react-dom'] = packageSource('react-dom', 'react-dom.development.js');
sources['react-dom/client'] = packageSource('react-dom', 'react-dom-client.development.js');
const schedulerRequire = createRequire(require.resolve('react-dom/client'));
sources.scheduler = readFileSync(join(dirname(schedulerRequire.resolve('scheduler')), 'cjs/scheduler.development.js'), 'utf8');

function moduleSource(name, path, extra = '') {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  sources[name] = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText + extra;
}

// Exercise the actual React component and hook files in Chromium. Only the
// surrounding UI and network are isolated; state, effects, and DOM inputs are real.
moduleSource('catalog-editor', '../src/components/admin/content/catalog-editor.tsx', '\nexports.HoursInput = HoursInput;');
moduleSource('document-shell', '../src/components/admin/content/document-shell.tsx');
moduleSource('./use-content-document', '../src/components/admin/content/use-content-document.ts');
moduleSource('../unsaved-changes', '../src/components/admin/unsaved-changes.tsx');
moduleSource('@/lib/content/validation', '../src/lib/content/validation.ts');
moduleSource('@/lib/content/catalog', '../src/lib/content/catalog.ts');
moduleSource('fallback', '../src/lib/content/fallback-content.ts');
sources['./document-shell'] = 'module.exports = require("document-shell");';
sources['./field-editors'] = 'exports.FieldsEditor = () => null;';
sources['../ui'] = `
  const React = require('react');
  const element = React.createElement;
  const box = ({ children }) => element('div', null, children);
  const button = ({ children, onClick, disabled, label }) => element('button', { onClick, disabled, 'aria-label': label }, children || label);
  exports.cx = (...values) => values.filter(Boolean).join(' ');
  exports.inputClass = '';
  for (const name of ['Badge', 'Card', 'Notice']) exports[name] = box;
  for (const name of ['ArrowIcon', 'ChevronIcon', 'EyeIcon', 'ExternalIcon', 'PlusIcon', 'TrashIcon', 'Spinner', 'SegmentedControl', 'Switch']) exports[name] = () => null;
  exports.Button = exports.IconButton = button;
  exports.Field = ({ children }) => children({ id: React.useId() });
  exports.TextInput = ({ label, value, onChange, onBlur }) => element('label', null, label, element('input', { value, onBlur, onChange: event => onChange(event.target.value) }));
  exports.TextArea = exports.TextInput;
  exports.Sheet = ({ open, title, children }) => open ? element('section', { 'aria-label': title }, children) : null;
  exports.useConfirm = () => React.useCallback(async options => { window.confirmations.push(options); return true; }, []);
  exports.useToast = () => React.useCallback(message => { window.notifications.push(message); }, []);
`;

const bundle = `
  const sources = ${JSON.stringify(sources)};
  const cache = {};
  window.confirmations = [];
  window.notifications = [];
  window.testRequire = function require(name) {
    if (!sources[name]) throw new Error('Unexpected fixture import: ' + name);
    if (!cache[name]) {
      const module = cache[name] = { exports: {} };
      new Function('require', 'exports', 'module', 'process', sources[name])(require, module.exports, module, { env: { NODE_ENV: 'development' } });
    }
    return cache[name].exports;
  };
`;

let browser;
before(async () => {
  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
});
after(async () => { await browser?.close(); });

async function fixture(t, setup) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => page.close());
  await page.setContent('<main id="root"></main>');
  await page.addScriptTag({ content: bundle + `
    const React = window.testRequire('react');
    const { createRoot } = window.testRequire('react-dom/client');
    const element = React.createElement;
    const root = createRoot(document.getElementById('root'));
    ${setup}
  ` });
  assert.deepEqual(errors, [], 'The React fixture should execute without page errors');
  return page;
}

test('HoursInput preserves 2. while typing and emits 150 minutes for 2.5', async (t) => {
  const page = await fixture(t, `
    const { HoursInput } = window.testRequire('catalog-editor');
    function Editor() {
      const [minutes, setMinutes] = React.useState(60);
      window.resetMinutes = setMinutes;
      return element(React.Fragment, null,
        element(HoursInput, { label: 'Duration', minutes, onChange: setMinutes }),
        element('output', null, minutes));
    }
    root.render(element(Editor));
  `);
  const input = page.getByLabel('Duration');
  await input.fill('2');
  await input.pressSequentially('.');
  assert.equal(await input.inputValue(), '2.');
  assert.equal(await page.locator('output').textContent(), '120');
  await input.pressSequentially('5');
  assert.equal(await input.inputValue(), '2.5');
  assert.equal(await page.locator('output').textContent(), '150');
  await input.fill('');
  assert.equal(await page.locator('output').textContent(), '150');
  await input.fill('169');
  assert.equal(await input.getAttribute('aria-invalid'), 'true');
  assert.equal(await page.locator('output').textContent(), '150');
  await page.evaluate(() => window.resetMinutes(180));
  await page.waitForFunction(() => document.querySelector('input').value === '3');
});

test('selected-page dirty state ignores and preserves unrelated site drafts', async (t) => {
  const page = await fixture(t, `
    const { UnsavedChangesProvider, useUnsavedChanges, useHasUnsavedChanges } = window.testRequire('../unsaved-changes');
    function Editor() {
      const [dirty, setDirty] = React.useState(false);
      useUnsavedChanges('site', true);
      useUnsavedChanges('page:home', dirty);
      const scoped = useHasUnsavedChanges('page:home');
      const global = useHasUnsavedChanges();
      return element(React.Fragment, null,
        element('output', null, JSON.stringify({ scoped, global })),
        element('button', { onClick: () => setDirty(!dirty) }, 'Toggle page'));
    }
    root.render(element(UnsavedChangesProvider, null, element(Editor)));
  `);
  await page.waitForFunction(() => document.querySelector('output').textContent === '{"scoped":false,"global":true}');
  await page.getByText('Toggle page').click();
  await page.waitForFunction(() => document.querySelector('output').textContent === '{"scoped":true,"global":true}');
  await page.getByText('Toggle page').click();
  await page.waitForFunction(() => document.querySelector('output').textContent === '{"scoped":false,"global":true}');
});

const hookFixture = `
  const { useContentDocument } = window.testRequire('./use-content-document');
  const value = window.testRequire('fallback').FALLBACK_CONTENT.find(doc => doc.key === 'page:home').value;
  window.remote = { key: 'page:home', kind: 'page', draft: value, published: value, version: 1, publishedRevisionId: null };
  window.requests = [];
  window.hold = false;
  window.conflictNext = false;
  window.fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    window.requests.push({ url, method: init.method || 'GET', body });
    if (window.hold) await new Promise(resolve => { window.release = resolve; });
    if (window.conflictNext && init.method === 'PUT') {
      window.conflictNext = false;
      window.remote.version++;
      return new Response(JSON.stringify({ message: 'Changed elsewhere' }), { status: 409 });
    }
    if (init.method === 'PUT') window.remote = { ...window.remote, draft: body.value, version: window.remote.version + 1 };
    if (url.endsWith('/publish')) {
      window.remote = { ...window.remote, published: window.remote.draft, version: window.remote.version + 1 };
      return new Response(JSON.stringify({ document: window.remote, affectedPaths: ['/'], cache: { refreshed: true } }));
    }
    return new Response(JSON.stringify(window.remote));
  };
`;

test('actual document hook preserves edits during save, resolves conflicts, then saves before publish', async (t) => {
  const page = await fixture(t, hookFixture + `
    function Editor() {
      window.state = useContentDocument('page:home', 'home');
      return element('output', null, JSON.stringify({ ready: !!window.state.doc, dirty: window.state.dirty, conflict: window.state.conflict, busy: window.state.busy }));
    }
    root.render(element(Editor));
  `);
  await page.waitForFunction(() => window.state.doc !== null);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'First edit' })));
  await page.waitForFunction(() => window.state.dirty);
  await page.evaluate(() => { window.hold = true; window.pendingSave = window.state.save(); });
  await page.waitForFunction(() => window.release !== undefined);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'Typed during save' })));
  await page.evaluate(async () => { window.hold = false; window.release(); await window.pendingSave; });
  await page.waitForFunction(() => window.state.doc.draft.title === 'First edit');
  assert.equal(await page.evaluate(() => window.state.draft.title), 'Typed during save');
  assert.equal(await page.evaluate(() => window.state.dirty), true);

  await page.evaluate(async () => { window.conflictNext = true; await window.state.save(); });
  await page.waitForFunction(() => window.state.conflict);
  await page.evaluate(async () => { await window.state.keepMine(); });
  await page.waitForFunction(() => !window.state.conflict && !window.state.dirty);
  assert.equal(await page.evaluate(() => window.remote.draft.title), 'Typed during save');

  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'Publish this' })));
  await page.waitForFunction(() => window.state.dirty);
  await page.evaluate(async () => { await window.state.publish(); });
  await page.waitForFunction(() => !window.state.dirty && window.state.status === 'live');
  const requests = await page.evaluate(() => window.requests.slice(-2));
  assert.deepEqual(requests.map(request => request.method), ['PUT', 'POST']);
  assert.equal(requests[1].body.expectedVersion, await page.evaluate(() => window.remote.version - 1));
  assert.equal(await page.evaluate(() => window.remote.published.title), 'Publish this');
});

test('DocumentShell labels dirty previews and blocks oversized drafts', async (t) => {
  const page = await fixture(t, hookFixture + `
    const { DocumentShell } = window.testRequire('document-shell');
    function Editor() {
      window.state = useContentDocument('page:home', 'home');
      return element(DocumentShell, { state: window.state, currentUserId: 'admin', previewTargets: [{ slug: 'home', label: 'Home' }] });
    }
    root.render(element(Editor));
  `);
  await page.waitForFunction(() => window.state.doc !== null);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'Draft title' })));
  await page.waitForFunction(() => window.state.dirty);
  const preview = page.getByRole('button', { name: 'Save & preview' });
  assert.equal(await preview.count(), 2);
  await preview.last().click();
  await page.getByRole('region', { name: 'Preview', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.remote.draft.title), 'Draft title');
  assert.equal(await page.evaluate(() => window.remote.published.title === 'Draft title'), false);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'x'.repeat(161) })));
  await page.waitForFunction(() => window.state.dirty);
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.includes('Save & preview') && button.disabled));
  assert.equal(await page.getByRole('button', { name: 'Publish', exact: true }).isDisabled(), true);
});

test('publishing a saved draft preserves text entered while publication is pending', async (t) => {
  const page = await fixture(t, hookFixture + `
    function Editor() {
      window.state = useContentDocument('page:home', 'home');
      return element('output', null, window.state.status);
    }
    root.render(element(Editor));
  `);
  await page.waitForFunction(() => window.state.doc !== null);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'Ready to publish' })));
  await page.waitForFunction(() => window.state.dirty);
  await page.evaluate(async () => { await window.state.save(); });
  await page.waitForFunction(() => !window.state.dirty);
  await page.evaluate(() => { window.hold = true; window.pendingPublish = window.state.publish(); });
  await page.waitForFunction(() => window.release !== undefined);
  await page.evaluate(() => window.state.setDraft(current => ({ ...current, title: 'Keep typing' })));
  await page.waitForFunction(() => window.state.draft.title === 'Keep typing');
  await page.evaluate(async () => { window.hold = false; window.release(); await window.pendingPublish; });
  assert.equal(await page.evaluate(() => window.state.draft.title), 'Keep typing');
  assert.equal(await page.evaluate(() => window.remote.published.title), 'Ready to publish');
  assert.equal(await page.evaluate(() => window.state.dirty), true);
});

test('invalid local hours block saving and publishing the previous stored duration', async (t) => {
  const page = await fixture(t, hookFixture + `
    const { CatalogEditor } = window.testRequire('catalog-editor');
    const catalogValue = window.testRequire('fallback').FALLBACK_CONTENT.find(doc => doc.key === 'catalog').value;
    window.remote = { key: 'catalog', kind: 'catalog', draft: catalogValue, published: catalogValue, version: 1, publishedRevisionId: null };
    window.firstPackage = catalogValue.categories[0].packages[0].name;
    root.render(element(CatalogEditor, { currentUserId: 'admin', previewTargets: [] }));
  `);
  const name = await page.evaluate(() => window.firstPackage);
  const row = page.locator('li').filter({ has: page.getByRole('button', { name: `Move ${name} down`, exact: true }) });
  await row.locator('button[aria-expanded]').click();
  const hours = row.getByLabel('Takes at least');
  await hours.fill('169');
  await row.getByLabel('Description', { exact: true }).fill('Edited description');
  assert.equal(await page.getByRole('button', { name: /^Save\s*draft$/ }).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Publish', exact: true }).isDisabled(), true);
  await hours.fill('2.5');
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'Savedraft' && !button.disabled));
});

test('catalog reordering preserves the expanded item and its intermediate hours text', async (t) => {
  const page = await fixture(t, hookFixture + `
    const { CatalogEditor } = window.testRequire('catalog-editor');
    const catalogValue = window.testRequire('fallback').FALLBACK_CONTENT.find(doc => doc.key === 'catalog').value;
    window.remote = { key: 'catalog', kind: 'catalog', draft: catalogValue, published: catalogValue, version: 1, publishedRevisionId: null };
    window.firstPackage = catalogValue.categories[0].packages[0].name;
    root.render(element(CatalogEditor, { currentUserId: 'admin', previewTargets: [] }));
  `);
  const name = await page.evaluate(() => window.firstPackage);
  const row = page.locator('li').filter({ has: page.getByRole('button', { name: `Move ${name} down`, exact: true }) });
  await row.locator('button[aria-expanded]').click();
  await row.getByLabel('Takes at least').fill('2.');
  await row.getByRole('button', { name: `Move ${name} down`, exact: true }).click();
  assert.equal(await row.locator('button[aria-expanded]').getAttribute('aria-expanded'), 'true');
  assert.equal(await row.getByLabel('Takes at least').inputValue(), '2.');
  assert.equal(await page.locator('ul').first().locator('li').nth(1).locator('button[aria-expanded]').getAttribute('aria-expanded'), 'true');
  await page.getByRole('button', { name: 'Add package', exact: true }).click();
  const added = page.locator('ul').first().locator('li').last();
  await added.locator('button[aria-expanded]').click();
  const input = added.getByLabel('Name', { exact: true });
  await input.fill('Custom');
  await input.pressSequentially(' package');
  assert.equal(await input.inputValue(), 'Custom package');
  await added.getByLabel('Tagline').click();
  assert.equal(await added.locator('button[aria-expanded]').getAttribute('aria-expanded'), 'true');
});

test('history prevents concurrent pagination and deduplicates overlapping revision IDs', async (t) => {
  const page = await fixture(t, hookFixture + `
    const { DocumentShell } = window.testRequire('document-shell');
    const documentFetch = window.fetch;
    window.historyRequests = [];
    const revision = (id, version) => ({ id, version, action: 'publish', createdAt: '2026-10-12T12:00:00Z', createdByUserId: 'admin' });
    window.fetch = async (url, init) => {
      if (!url.includes('/revisions?')) return documentFetch(url, init);
      const page = Number(new URL(url, 'https://example.test').searchParams.get('page'));
      window.historyRequests.push(page);
      if (page === 2) await new Promise(resolve => { window.releaseHistory = resolve; });
      return new Response(JSON.stringify({ total: 3, revisions: page === 1 ? [revision('one', 1)] : [revision('one', 1), revision('two', 2)] }));
    };
    function Editor() {
      window.state = useContentDocument('page:home', 'home');
      return element(DocumentShell, { state: window.state, currentUserId: 'admin', previewTargets: [] });
    }
    root.render(element(Editor));
  `);
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByText('Version 1', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Show older versions' }).evaluate(button => { button.click(); button.click(); });
  await page.waitForFunction(() => window.releaseHistory !== undefined);
  assert.deepEqual(await page.evaluate(() => window.historyRequests), [1, 2]);
  await page.evaluate(() => window.releaseHistory());
  await page.getByText('Version 2', { exact: true }).waitFor();
  assert.equal(await page.getByText('Version 1', { exact: true }).count(), 1);
});
