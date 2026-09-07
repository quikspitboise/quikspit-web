import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Exercise the actual TypeScript modules without loading React or the embed SDK.
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

const data = loadModule('../src/components/booking/booking-data.ts');
const { calculatePricing, normalizePaintCorrection } = loadModule(
  '../src/components/booking/pricing-utils.ts', { './booking-data': data },
);
const price = (id) => data.ceramicServices.find((service) => service.id === id).price;
const base = {
  selectedPackage: data.allPackagesFlat.find((pkg) => data.isCeramicEligible(pkg)),
  vehicleSize: 'car',
  selectedAddons: new Set(),
  ceramicCoatingSelected: false,
  selectedPaintCorrection: null,
};

test('retains and charges two-step correction when adding or removing coating', () => {
  let correction = 'paint-correction-2';
  correction = normalizePaintCorrection(correction, true);
  assert.equal(correction, 'paint-correction-2-upgrade');
  const coated = calculatePricing({ ...base, ceramicCoatingSelected: true, selectedPaintCorrection: correction });
  assert.equal(coated.ceramicTotal, price('graphene-coating') + price('paint-correction-2') - price('paint-correction-1'));

  correction = normalizePaintCorrection(correction, false);
  assert.equal(correction, 'paint-correction-2');
  const uncoated = calculatePricing({ ...base, selectedPaintCorrection: correction });
  assert.equal(uncoated.ceramicTotal, price('paint-correction-2'));
});

test('also normalizes stale correction identifiers in price calculation', () => {
  assert.equal(calculatePricing({ ...base, selectedPaintCorrection: 'paint-correction-2-upgrade' }).ceramicTotal,
    price('paint-correction-2'));
  assert.equal(calculatePricing({ ...base, ceramicCoatingSelected: true, selectedPaintCorrection: 'paint-correction-2' }).ceramicTotal,
    price('graphene-coating') + price('paint-correction-2') - price('paint-correction-1'));
});

test('does not double-charge included correction or accept other services as correction', () => {
  assert.equal(normalizePaintCorrection('paint-correction-1', true), null);
  assert.equal(normalizePaintCorrection('graphene-coating', false), null);
  assert.equal(normalizePaintCorrection('unknown', false), null);
  assert.equal(calculatePricing({ ...base, ceramicCoatingSelected: true, selectedPaintCorrection: 'paint-correction-1' }).ceramicTotal,
    price('graphene-coating'));
});
