import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const h = React.createElement;
const empty = () => null;
const mocks = {
  // Keep media/network integrations out of these synchronous render tests.
  '@/components/ui/video-hero': { VideoHero: ({ children }) => h('div', null, children) },
  '@/components/reviews-section': { ReviewsSection: empty },
  '@/components/owner-image': { OwnerImage: empty },
  '@/components/gallery-grid': { GalleryGrid: empty },
  '@/components/gallery-loading-shell': { GalleryGridSkeleton: empty },
  '@/components/InstagramEmbedWithSkeleton': { default: empty, __esModule: true },
  '@/components/TikTokEmbedWithSkeleton': { default: empty, __esModule: true },
  '@/components/home-structured-data': { HomeStructuredData: empty },
  '@/lib/server/gallery-api': { fetchPublicGalleryItems: async () => ({ items: [], source: 'api' }) },
  '@/lib/server/booking-settings-api': { fetchCachedBookingSettings: async () => ({ depositAmount: 0 }) },
  '@/lib/content/metadata': { buildLocalBusinessData: () => ({}) },
};
const modules = new Map();

// Like content.test.mjs, transpile the actual TS modules. React, Next links,
// the section renderers, and booking components run without replacements.
function loadModule(path) {
  const file = resolve(path);
  if (modules.has(file)) return modules.get(file);
  const source = readFileSync(file, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const exports = {};
  modules.set(file, exports);
  new Function('require', 'exports', outputText)((name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
    const base = name.startsWith('@/') ? resolve(sourceRoot, name.slice(2)) : resolve(dirname(file), name);
    const dependency = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(candidate));
    assert.ok(dependency, `Cannot find ${name} imported by ${file}`);
    return loadModule(dependency);
  }, exports);
  return exports;
}

const load = (path) => loadModule(resolve(sourceRoot, path));
const { toPreviewHref } = load('lib/content/types.ts');
const { FALLBACK_CONTENT } = load('lib/content/fallback-content.ts');
const { SiteContentProvider } = load('components/content/site-content-context.tsx');
const { ContentSection } = load('components/content/sections.tsx');
const { ContentPage } = load('components/content/content-page.tsx');
const { PackagesTabs } = load('components/packages-tabs.tsx');
const { BookingCopyProvider } = load('components/booking/booking-copy.tsx');
const { BOOKING_COPY_DEFAULTS, CONTACT_COPY_DEFAULTS, visitorCopy, resolveContactCopy } = load('components/content/visitor-copy.ts');
const catalogHelpers = load('lib/content/catalog.ts');
const { parseBookingParams } = load('lib/booking-params.ts');
const site = FALLBACK_CONTENT.find((document) => document.key === 'site').value;
const catalog = FALLBACK_CONTENT.find((document) => document.key === 'catalog').value;
const pages = Object.fromEntries(FALLBACK_CONTENT.filter((document) => document.kind === 'page')
  .map((document) => [document.key.slice(5), document.value]));
const previewBase = '/admin/preview';
const snapshot = { site, catalog, pages, catalogRevisionId: null, source: 'draft' };
const ctx = { content: snapshot, slug: 'home', depositAmount: 0, tokens: {}, preview: true, previewBase };
const section = (type, fields) => ({ id: 'test-section', type, enabled: true, fields });
const render = (element, options = {}) => renderToStaticMarkup(h(SiteContentProvider, {
  site: options.site ?? site, previewBase: options.previewBase,
}, element));
const renderSection = (value, context = ctx) => render(h(ContentSection, { section: value, ctx: context }), {
  site: context.content.site, previewBase: context.previewBase,
});
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'));

test('preview URLs preserve complete query strings and fragments, including home links', () => {
  for (const [href, expected] of [
    ['/booking?category=combo&package=gold#design-your-detail', '/admin/preview/booking?category=combo&package=gold#design-your-detail'],
    ['/?campaign=a%2Fb#faq', '/admin/preview/home?campaign=a%2Fb#faq'],
    ['/#faq', '/admin/preview/home#faq'],
    ['/?campaign=a', '/admin/preview/home?campaign=a'],
    ['/', '/admin/preview/home'],
    ['/pricing?#a#b', '/admin/preview/pricing?#a#b'],
  ]) assert.equal(toPreviewHref(href, previewBase), expected, href);
  assert.equal(toPreviewHref('/pricing?x=1#faq', `${previewBase}/`), '/admin/preview/pricing?x=1#faq');
});

test('preview leaves external, API, asset, admin, and page-local links alone', () => {
  for (const href of [
    'https://cal.com/quikspitboise', 'mailto:a@example.com', 'tel:+12089604970',
    '//example.com/pricing', '#faq', '?package=gold',
    '/api/contact?x=1', '/api', '/_next/image?url=%2Fhero.jpg', '/assets/logo',
    '/images/owner', '/videos/hero', '/uploads/photo', '/media/clip', '/fonts/display',
    '/hero_fallback.jpg?size=large#photo', '/manifest.json', '/favicon.ico', '/admin/preview/pricing?x=1',
  ]) assert.equal(toPreviewHref(href, previewBase), href, href);
  assert.equal(toPreviewHref('/pricing?x=1#faq'), '/pricing?x=1#faq');
});

test('actual section CTAs and service rows stay inside preview', () => {
  const primaryLink = { label: 'Book now', href: '/booking?category=combo&package=gold#design-your-detail' };
  const secondaryLink = { label: 'Prices', href: '/pricing#packages' };
  const expected = [toPreviewHref(primaryLink.href, previewBase), toPreviewHref(secondaryLink.href, previewBase)];
  const cases = [
    [section('hero', { lines: ['A clean car'], primaryLink, secondaryLink }), expected],
    [section('rich-text', { heading: 'Story', link: primaryLink }), expected.slice(0, 1)],
    [section('services', { heading: 'Services', link: primaryLink, items: [{ name: 'Service', href: secondaryLink.href }] }), expected],
    [section('services', { items: [{ name: 'Service' }] }), ['/admin/preview/pricing']],
    [section('steps', { link: primaryLink }), expected.slice(0, 1)],
    [section('social', { link: primaryLink }), expected.slice(0, 1)],
    [section('cta', { primaryLink, secondaryLink }), expected],
    [section('cta', { primaryLink, secondaryLink, showPhone: true }), [`tel:${site.business.phone}`, ...expected]],
    [section('cta', { primaryLink, showPhone: true }), [expected[0], `tel:${site.business.phone}`]],
  ];
  for (const [value, links] of cases) assert.deepEqual(hrefs(renderSection(value)), links, value.type);
  assert.deepEqual(hrefs(renderSection(section('cta', { primaryLink }), { ...ctx, preview: false, previewBase: undefined })), [primaryLink.href]);
  assert.deepEqual(hrefs(renderSection(section('rich-text', { link: { label: 'Calendar', href: 'https://cal.com/quikspitboise' } }))), ['https://cal.com/quikspitboise']);
  const localSocial = { ...site, socialLinks: [{ label: 'More', href: '/gallery?sort=recent' }] };
  const contactLinks = hrefs(renderSection(section('contact', {}), { ...ctx, content: { ...snapshot, site: localSocial } }));
  assert.ok(contactLinks.includes('/admin/preview/gallery?sort=recent'));
});

test('rendered package links retain their booking selection and derive the base vehicle label', () => {
  const changed = structuredClone(catalog);
  changed.vehicleSizes.find((size) => size.surchargeCents === 0).label = 'Compact hatchback';
  const html = renderSection(section('services', { catalogGroup: 'categories' }), {
    ...ctx, content: { ...snapshot, catalog: changed },
  });
  assert.match(html, /for Compact hatchback/);
  assert.doesNotMatch(html, /for a car/);
  const categories = catalogHelpers.publicCategories(changed);
  const links = hrefs(html);
  assert.equal(links.length, categories[0].packages.length);
  for (let index = 0; index < links.length; index++) {
    const url = new URL(links[index], 'https://preview.example');
    assert.equal(url.pathname, '/admin/preview/booking');
    assert.equal(url.hash, '#design-your-detail');
    const selection = parseBookingParams(url.searchParams, changed);
    assert.equal(selection.categoryId, categories[0].id);
    assert.equal(selection.packageId, categories[0].packages[index].id);
  }
  const publicHtml = render(h(PackagesTabs, { categories, vehicleSizeLabel: 'Compact hatchback' }));
  assert.ok(hrefs(publicHtml).every((href) => href.startsWith('/booking?')));
});

test('ContentPage supplies preview context to actual client package renderers', async () => {
  const page = { ...pages.pricing, sections: [section('services', { catalogGroup: 'categories' })] };
  const html = renderToStaticMarkup(await ContentPage({ content: snapshot, page, slug: 'pricing', preview: true }));
  assert.ok(hrefs(html).length > 0);
  assert.ok(hrefs(html).every((href) => href.startsWith('/admin/preview/booking?')));
});

test('footer social destinations keep site-relative links in preview', () => {
  const { Footer } = load('components/footer.tsx');
  const changed = { ...site, socialLinks: [
    { label: 'Gallery', href: '/gallery?sort=recent#photos' },
    { label: 'Instagram', href: 'https://www.instagram.com/quikspitboise/' },
  ] };
  const links = hrefs(render(h(Footer, { site: changed, previewBase })));
  assert.ok(links.includes('/admin/preview/gallery?sort=recent#photos'));
  assert.ok(links.includes('https://www.instagram.com/quikspitboise/'));
});

test('contact labels render from section copy while retaining legacy labels', () => {
  const value = section('contact', {
    submitLabel: 'Send this request', sendingLabel: 'Please wait', successMessage: 'Delivered', photoLabel: 'Legacy photo',
    formCopy: { nameLabel: 'Full name', emailLabel: 'Reply address', messageLabel: 'Your request', messagePlaceholder: 'Describe your vehicle', photoLabel: 'Edited photo' },
  });
  const html = renderSection(value);
  for (const text of ['Full name', 'Reply address', 'Your request', 'Describe your vehicle', 'Edited photo', 'Send this request']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /Legacy photo/);
  const resolved = resolveContactCopy(value.fields);
  assert.equal(resolved.sendingLabel, 'Please wait');
  assert.equal(resolved.successMessage, 'Delivered');
  assert.match(renderSection(section('contact', { photoLabel: 'Saved photo' })), /Saved photo/);
  const oldHtml = renderSection(section('contact', { formCopy: { nameLabel: 42, emailLabel: '' } }));
  assert.match(oldHtml, />Name<\/label>/);
  assert.match(oldHtml, />Email<\/label>/);
});

test('booking steps, accessible labels, summary, and confirmation render edited copy', () => {
  const overrides = Object.fromEntries(Object.keys(BOOKING_COPY_DEFAULTS).map((key) => [key, `Edited ${key}`]));
  overrides.stepCount = 'Stage {current} / {total}';
  overrides.includedCorrectionMessage = '{service} is included';
  overrides.upgradeServiceLabel = 'Upgrade: {service}';
  overrides.paidAmountLabel = 'Paid {amount}';
  const bookingRender = (name, props) => {
    const Component = load(`components/booking/${name}.tsx`)[{
      'vehicle-step': 'VehicleStep', 'package-step': 'PackageStep', 'addons-step': 'AddonsStep',
      'ceramic-step': 'CeramicStep', 'step-indicator': 'StepIndicator',
      'booking-summary': 'BookingSummary', 'confirmation-step': 'ConfirmationStep', 'booking-wizard': 'BookingWizard',
    }[name]];
    return render(h(BookingCopyProvider, { copy: overrides }, h(Component, props)));
  };
  const vehicle = bookingRender('vehicle-step', { sizes: catalog.vehicleSizes, vehicleSizeId: 'car', onSelect: empty });
  for (const key of ['vehicleHeading', 'vehicleDescription', 'vehicleGroupLabel', 'basePriceLabel']) assert.ok(vehicle.includes(`Edited ${key}`), key);
  const packages = bookingRender('package-step', { categories: catalogHelpers.publicCategories(catalog), selected: null, sizeAddCents: 0, onSelect: empty });
  for (const key of ['packageHeading', 'packageDescription', 'packageLabel', 'compareDetailsLabel', 'showDetailsLabel']) assert.ok(packages.includes(`Edited ${key}`), key);
  const addons = bookingRender('addons-step', { addons: catalog.addons, selectedAddonIds: [], onToggle: empty });
  assert.ok(addons.includes('Edited addonsHeading'));
  const coating = catalog.ceramicServices.find((service) => service.kind === 'coating');
  const included = catalogHelpers.includedCorrection(catalog, coating);
  const ceramic = bookingRender('ceramic-step', {
    coatings: [coating], corrections: catalogHelpers.correctionOptions(catalog, coating), includedCorrection: included,
    onSelectCoating: empty, onSelectCorrection: empty,
  });
  for (const key of ['ceramicHeading', 'ceramicDescription', 'upgradeLabel']) assert.ok(ceramic.includes(`Edited ${key}`), key);
  assert.ok(ceramic.includes(renderToStaticMarkup(h(React.Fragment, null, `${included.name} is included`))));
  const progress = bookingRender('step-indicator', { steps: [{ label: 'Vehicle', shortLabel: 'Vehicle' }, { label: 'Time', shortLabel: 'Time' }], currentStep: 0, onStepClick: empty });
  assert.match(progress, /aria-label="Edited progressLabel"/);
  assert.match(progress, /Stage 1 \/ 2/);
  const quote = catalogHelpers.calculateQuote(catalog, {
    categoryId: 'combo', packageId: 'platinum', vehicleSizeId: 'car', addonIds: [catalog.addons[0].id],
    coatingId: coating.id, correctionId: 'paint-correction-2',
  });
  const { toBookingSelection } = load('components/booking/booking-data.ts');
  const selection = toBookingSelection(quote);
  const summary = bookingRender('booking-summary', { selection, depositAmount: 50, onEditStep: empty });
  for (const key of ['summaryHeading', 'summaryLabel', 'editLabel', 'vehicleLabel', 'packageLabel', 'addonsLabel', 'coatingLabel', 'correctionLabel', 'durationLabel', 'estimatedTotalLabel', 'depositTodayLabel', 'dueAtAppointmentLabel', 'finalPriceMessage', 'showSummaryLabel']) assert.ok(summary.includes(`Edited ${key}`), key);
  const confirmation = bookingRender('confirmation-step', { selection, depositAmount: 50 });
  for (const key of ['confirmationHeading', 'confirmationDescription', 'bookingDepositLabel', 'balanceLabel', 'prepHeading', 'prepAddress', 'prepValuables', 'prepArrival', 'prepReschedule', 'questionsLabel']) assert.ok(confirmation.includes(`Edited ${key}`), key);
  assert.match(confirmation, /Paid \$50/);
  assert.ok(hrefs(confirmation).includes(`tel:${site.business.phone}`));
  const wizard = bookingRender('booking-wizard', { catalog, catalogRevisionId: null, depositAmount: 0, depositPolicy: '', preview: true });
  for (const key of ['vehicleLabel', 'packageLabel', 'addonsLabel', 'scheduleLabel', 'vehicleHeading']) assert.ok(wizard.includes(`Edited ${key}`), key);
});

test('copy defaults match seed and fallback, and editor exposes the contact and booking fields', () => {
  const { INITIAL_CONTENT_V1 } = loadModule(resolve(sourceRoot, '../../backend/src/content/content-seed.v1.ts'));
  assert.deepEqual(FALLBACK_CONTENT, INITIAL_CONTENT_V1);
  const { sectionFields } = load('components/admin/content/section-schemas.tsx');
  const schemaContext = { slug: 'contact', priceSources: [] };
  const contact = pages.contact.sections.find((value) => value.type === 'contact');
  assert.deepEqual(resolveContactCopy(contact.fields), CONTACT_COPY_DEFAULTS);
  const contactSchema = sectionFields(contact, schemaContext);
  for (const key of ['submitLabel', 'sendingLabel', 'successMessage', 'photoLabel']) assert.ok(contactSchema.some((field) => field.key === key), key);
  assert.ok(contactSchema.find((field) => field.key === 'formCopy').fields.some((field) => field.key === 'nameLabel'));
  const booking = pages.booking.sections.find((value) => value.type === 'booking');
  assert.deepEqual(booking.fields.copy, BOOKING_COPY_DEFAULTS);
  assert.ok(sectionFields(booking, { ...schemaContext, slug: 'booking' }).find((field) => field.key === 'copy').fields.some((field) => field.key === 'confirmationHeading'));
  assert.equal(visitorCopy({}, BOOKING_COPY_DEFAULTS, 'stepCount', { current: 2, total: 5 }), 'Step 2 of 5');
  assert.equal(visitorCopy({ stepCount: 'Part {current}: {unknown}' }, BOOKING_COPY_DEFAULTS, 'stepCount', { current: 2 }), 'Part 2: {unknown}');
  assert.ok(site.copy.seo.keywords.includes('Boise car detailing'));
});
