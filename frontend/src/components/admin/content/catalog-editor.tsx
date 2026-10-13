'use client';

import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { formatCents } from '@/lib/content/catalog';
import { makeId } from '@/lib/content/validation';
import type {
  CatalogAddon,
  CatalogCategory,
  CatalogContent,
  CatalogPackage,
  CeramicService,
  Duration,
  VehicleSize,
} from '@/lib/content/types';
import {
  ArrowIcon,
  Badge,
  Button,
  Card,
  ChevronIcon,
  Field,
  IconButton,
  PlusIcon,
  SegmentedControl,
  Switch,
  TextArea,
  TextInput,
  TrashIcon,
  cx,
  inputClass,
} from '../ui';
import { DocumentShell, useDraftInputProblem, type PreviewTarget } from './document-shell';
import { FieldsEditor } from './field-editors';
import { useContentDocument } from './use-content-document';

/* ─── Inputs ─── */

function MoneyInput({ label, cents, onChange, hint }: { label: string; cents: number; onChange: (cents: number) => void; hint?: ReactNode }) {
  const [text, setText] = useState(() => (cents / 100).toString());
  // Follow outside changes (discard, restore) without fighting typing.
  useEffect(() => {
    setText((current) => (Math.round(Number(current) * 100) === cents ? current : (cents / 100).toString()));
  }, [cents]);
  const parsed = Number(text);
  const invalid = text.trim() === '' || !Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000;
  useDraftInputProblem(invalid ? `${label}: enter a price from $0 to $1,000,000.` : null);

  return (
    <Field label={label} hint={hint} error={invalid ? 'Enter a price of $0 or more.' : null}>
      {({ id, describedBy }) => (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            inputMode="decimal"
            value={text}
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d.]/g, '');
              setText(next);
              const value = Number(next);
              if (next.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 1_000_000) onChange(Math.round(value * 100));
            }}
            className={cx(inputClass, 'pl-7 tabular')}
          />
        </div>
      )}
    </Field>
  );
}

function HoursInput({ label, minutes, onChange }: { label: string; minutes: number; onChange: (minutes: number) => void }) {
  const id = useId();
  const [text, setText] = useState(() => (Math.round((minutes / 60) * 100) / 100).toString());
  useEffect(() => {
    setText((current) => (current.trim() !== '' && Math.round(Number(current) * 60) === minutes
      ? current
      : (Math.round((minutes / 60) * 100) / 100).toString()));
  }, [minutes]);
  const hours = Number(text);
  const invalid = text.trim() === '' || !Number.isFinite(hours) || hours < 0 || hours > 168;
  useDraftInputProblem(invalid ? `${label}: enter a duration from 0 to 168 hours.` : null);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-invalid={invalid}
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            const value = Number(next);
            if (next.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 168) onChange(Math.round(value * 60));
          }}
          className={cx(inputClass, 'pr-14 tabular')}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">hours</span>
      </div>
    </div>
  );
}

function DurationInputs({ duration, onChange }: { duration: Duration; onChange: (duration: Duration) => void }) {
  const invalid = duration.minMinutes > duration.maxMinutes;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <HoursInput label="Takes at least" minutes={duration.minMinutes} onChange={(minMinutes) => onChange({ ...duration, minMinutes })} />
        <HoursInput label="Takes at most" minutes={duration.maxMinutes} onChange={(maxMinutes) => onChange({ ...duration, maxMinutes })} />
      </div>
      {invalid && <p className="mt-1.5 text-xs text-red-300">The shortest time is longer than the longest.</p>}
    </div>
  );
}

/* ─── Collapsible item row ─── */

function ItemRow({
  title,
  meta,
  enabled,
  onToggleEnabled,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  meta?: ReactNode;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  index: number;
  count: number;
  onMove: (to: number) => void;
  /** Only for items that were never published. */
  onRemove?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  return (
    <li className={cx('rounded-xl border', open ? 'border-white/20 bg-white/[0.02]' : 'border-white/[0.08]', !enabled && 'border-dashed')}>
      <div className="flex items-center gap-1 pr-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left"
        >
          <ChevronIcon direction={open ? 'up' : 'down'} className="h-4 w-4 shrink-0 text-neutral-500" />
          <span className="min-w-0">
            <span className={cx('block truncate font-medium', enabled ? 'text-white' : 'text-neutral-500')}>{title || 'Untitled'}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
              {meta}
              {!enabled && <Badge tone="neutral">Off</Badge>}
            </span>
          </span>
        </button>
        <IconButton label={`Move ${title} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowIcon direction="up" />
        </IconButton>
        <IconButton label={`Move ${title} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowIcon direction="down" />
        </IconButton>
      </div>
      {open && (
        <div id={bodyId} className="space-y-4 border-t border-white/[0.06] p-3 sm:p-4">
          <Switch
            label="Offered"
            description={enabled ? 'Visitors can see and book this.' : 'Hidden from the site and booking. Turn off instead of deleting so old links keep working.'}
            checked={enabled}
            onChange={onToggleEnabled}
          />
          {children}
          {onRemove && (
            <div className="border-t border-white/[0.06] pt-3">
              <Button size="sm" variant="danger" onClick={onRemove}>
                <TrashIcon /> Remove
              </Button>
              <p className="mt-1.5 text-xs text-neutral-500">This was never published, so it can be removed.</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const replaceAt = <T,>(items: T[], index: number, item: T) => items.map((entry, i) => (i === index ? item : entry));

/* ─── Validation ─── */

function catalogProblems(catalog: CatalogContent): string[] {
  const problems: string[] = [];
  const slug = /^[a-z0-9][a-z0-9-]{0,99}$/;
  if (!slug.test(catalog.calUsername)) problems.push('Cal.com username: use lowercase letters, numbers, and dashes.');
  if (!catalog.categories.some((category) => category.enabled && category.packages.some((pkg) => pkg.enabled))) {
    problems.push('Offer at least one package.');
  }
  if (!catalog.vehicleSizes.some((size) => size.enabled)) problems.push('Offer at least one vehicle size.');
  for (const category of catalog.categories) {
    if (!slug.test(category.calEventSlug)) problems.push(`${category.label}: the Cal.com event needs lowercase letters, numbers, and dashes.`);
    for (const pkg of category.packages) {
      if (pkg.duration.minMinutes > pkg.duration.maxMinutes) problems.push(`${pkg.name}: shortest time is longer than the longest.`);
    }
  }
  for (const service of catalog.ceramicServices) {
    if (service.duration.minMinutes > service.duration.maxMinutes) problems.push(`${service.name}: shortest time is longer than the longest.`);
    if (service.kind === 'coating' && service.includedCorrectionId && service.enabled) {
      const included = catalog.ceramicServices.find((item) => item.id === service.includedCorrectionId);
      if (!included?.enabled) problems.push(`${service.name}: the included correction must be offered too.`);
    }
  }
  return problems;
}

/* ─── Editor ─── */

export function CatalogEditor({ currentUserId, previewTargets }: { currentUserId: string; previewTargets: PreviewTarget[] }) {
  const state = useContentDocument<CatalogContent>('catalog', 'services & prices');
  const catalog = state.draft;
  const [categoryIndex, setCategoryIndex] = useState(0);
  const problems = useMemo(() => (catalog ? catalogProblems(catalog) : []), [catalog]);

  // IDs are permanent once published: links and booking records refer to them.
  const published = state.doc?.published ?? null;
  const publishedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!published) return ids;
    for (const category of published.categories) {
      ids.add(`category:${category.id}`);
      for (const pkg of category.packages) ids.add(`package:${category.id}/${pkg.id}`);
    }
    for (const size of published.vehicleSizes) ids.add(`size:${size.id}`);
    for (const addon of published.addons) ids.add(`addon:${addon.id}`);
    for (const service of published.ceramicServices) ids.add(`service:${service.id}`);
    return ids;
  }, [published]);

  if (!catalog) return <DocumentShell state={state} currentUserId={currentUserId} previewTargets={previewTargets}>{null}</DocumentShell>;

  const update = (change: (current: CatalogContent) => CatalogContent) =>
    state.setDraft((current) => (current ? change(current) : current));

  const category = catalog.categories[Math.min(categoryIndex, catalog.categories.length - 1)];

  const setCategory = (next: CatalogCategory) =>
    update((current) => ({ ...current, categories: current.categories.map((item) => (item.id === category.id ? next : item)) }));

  const setPackage = (index: number, next: CatalogPackage) => setCategory({ ...category, packages: replaceAt(category.packages, index, next) });

  const setService = (index: number, next: CeramicService) =>
    update((current) => {
      const previousId = current.ceramicServices[index].id;
      return {
        ...current,
        ceramicServices: current.ceramicServices.map((service, i) =>
          i === index
            ? next
            : service.includedCorrectionId === previousId && previousId !== next.id
              ? { ...service, includedCorrectionId: next.id }
              : service,
        ),
      };
    });

  const corrections = catalog.ceramicServices.filter((service) => service.kind === 'correction');

  return (
    <DocumentShell state={state} currentUserId={currentUserId} previewTargets={previewTargets} problems={problems}>
      <Card
        title="Packages"
        description="Prices are for the smallest vehicle. Vehicle size surcharges are added on top in booking."
      >
        <SegmentedControl
          label="Package category"
          className="mb-4"
          value={category.id}
          onChange={(id) => setCategoryIndex(catalog.categories.findIndex((item) => item.id === id))}
          options={catalog.categories.map((item) => ({ value: item.id, label: item.label }))}
        />

        <details className="group mb-4 rounded-xl border border-white/[0.08]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 text-sm">
            <span className="min-w-0">
              <span className="block font-medium text-neutral-200">Category details</span>
              <span className="block truncate text-xs text-neutral-500">{category.enabled ? category.blurb : 'Not offered'}</span>
            </span>
            <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-500 group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-white/[0.06] p-3 sm:p-4">
            <TextInput label="Name" value={category.label} onChange={(label) => setCategory({ ...category, label })} />
            <TextArea label="Short description" rows={2} value={category.blurb} onChange={(blurb) => setCategory({ ...category, blurb })} />
            <Switch label="Offered" checked={category.enabled} onChange={(enabled) => setCategory({ ...category, enabled })} description="Turning a category off hides all of its packages." />
            <TextInput
              label="Cal.com event"
              hint={`Bookings open cal.com/${catalog.calUsername}/${category.calEventSlug}. Change only if you renamed the event in Cal.com.`}
              value={category.calEventSlug}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(calEventSlug) => setCategory({ ...category, calEventSlug: calEventSlug.trim().toLowerCase() })}
            />
          </div>
        </details>

        <ul className="space-y-2">
          {category.packages.map((pkg, index) => (
            <ItemRow
              key={`${category.id}/${pkg.id}`}
              title={pkg.name}
              meta={
                <>
                  <span className="tabular">{formatCents(pkg.basePriceCents)}</span>
                  {pkg.highlight && <Badge tone="info">Most popular</Badge>}
                  {pkg.bestValue && <Badge tone="info">Best value</Badge>}
                </>
              }
              enabled={pkg.enabled}
              onToggleEnabled={(enabled) => setPackage(index, { ...pkg, enabled })}
              index={index}
              count={category.packages.length}
              onMove={(to) => setCategory({ ...category, packages: move(category.packages, index, to) })}
              onRemove={
                publishedIds.has(`package:${category.id}/${pkg.id}`) || category.packages.length === 1
                  ? undefined
                  : () => setCategory({ ...category, packages: category.packages.filter((_, i) => i !== index) })
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Name"
                  value={pkg.name}
                  onChange={(name) => setPackage(index, { ...pkg, name })}
                />
                <MoneyInput label="Price" cents={pkg.basePriceCents} onChange={(basePriceCents) => setPackage(index, { ...pkg, basePriceCents })} />
                <TextInput label="Tagline" value={pkg.tagline} onChange={(tagline) => setPackage(index, { ...pkg, tagline })} className="sm:col-span-2" />
                <TextArea label="Description" rows={2} value={pkg.description} onChange={(description) => setPackage(index, { ...pkg, description })} className="sm:col-span-2" />
              </div>
              <FieldsEditor
                fields={[{ kind: 'textList', key: 'features', label: 'What’s included', itemLabel: 'Item' }]}
                value={{ features: pkg.features }}
                onChange={(next) => setPackage(index, { ...pkg, features: (next.features as string[] | undefined) ?? [] })}
              />
              <div className="grid gap-x-6 sm:grid-cols-2">
                <Switch label="Most popular badge" checked={pkg.highlight} onChange={(highlight) => setPackage(index, { ...pkg, highlight })} />
                <Switch label="Best value badge" checked={pkg.bestValue} onChange={(bestValue) => setPackage(index, { ...pkg, bestValue })} />
                <Switch
                  label="Allows ceramic coating"
                  description="Offers coating and paint correction when booking this package."
                  checked={pkg.ceramicEligible}
                  onChange={(ceramicEligible) => setPackage(index, { ...pkg, ceramicEligible })}
                  className="sm:col-span-2"
                />
              </div>
              <DurationInputs duration={pkg.duration} onChange={(duration) => setPackage(index, { ...pkg, duration })} />
              <p className="text-xs text-neutral-600">ID {pkg.id}</p>
            </ItemRow>
          ))}
        </ul>
        {category.packages.length < 30 && (
          <Button
            size="sm"
            className="mt-3"
            onClick={() => {
              const name = 'New package';
              setCategory({
                ...category,
                packages: [
                  ...category.packages,
                  {
                    id: makeId(name, category.packages.map((item) => item.id)),
                    name,
                    tagline: '',
                    description: '',
                    basePriceCents: 0,
                    features: [],
                    enabled: false,
                    highlight: false,
                    bestValue: false,
                    ceramicEligible: false,
                    duration: { minMinutes: 60, maxMinutes: 120 },
                  },
                ],
              });
            }}
          >
            <PlusIcon /> Add package
          </Button>
        )}
      </Card>

      <Card title="Vehicle sizes" description="Added to every package price. Use $0 for the base size.">
        <ul className="space-y-2">
          {catalog.vehicleSizes.map((size, index) => {
            const setSize = (next: VehicleSize) => update((current) => ({ ...current, vehicleSizes: replaceAt(current.vehicleSizes, index, next) }));
            return (
              <ItemRow
                key={size.id}
                title={size.label}
                meta={<span className="tabular">{size.surchargeCents ? `+${formatCents(size.surchargeCents)}` : 'Base price'}</span>}
                enabled={size.enabled}
                onToggleEnabled={(enabled) => setSize({ ...size, enabled })}
                index={index}
                count={catalog.vehicleSizes.length}
                onMove={(to) => update((current) => ({ ...current, vehicleSizes: move(current.vehicleSizes, index, to) }))}
                onRemove={
                  publishedIds.has(`size:${size.id}`)
                    ? undefined
                    : () => update((current) => ({ ...current, vehicleSizes: current.vehicleSizes.filter((_, i) => i !== index) }))
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Name"
                    value={size.label}
                    onChange={(label) => setSize({ ...size, label })}
                  />
                  <MoneyInput label="Extra charge" cents={size.surchargeCents} onChange={(surchargeCents) => setSize({ ...size, surchargeCents })} />
                </div>
              </ItemRow>
            );
          })}
        </ul>
        {catalog.vehicleSizes.length < 20 && (
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              update((current) => ({
                ...current,
                vehicleSizes: [
                  ...current.vehicleSizes,
                  { id: makeId('New size', current.vehicleSizes.map((item) => item.id)), label: 'New size', surchargeCents: 0, enabled: false },
                ],
              }))
            }
          >
            <PlusIcon /> Add vehicle size
          </Button>
        )}
      </Card>

      <Card title="Add-ons" description="Optional extras customers can add to any package.">
        <ul className="space-y-2">
          {catalog.addons.map((addon, index) => {
            const setAddon = (next: CatalogAddon) => update((current) => ({ ...current, addons: replaceAt(current.addons, index, next) }));
            return (
              <ItemRow
                key={addon.id}
                title={addon.name}
                meta={<span className="tabular">+{formatCents(addon.priceCents)}</span>}
                enabled={addon.enabled}
                onToggleEnabled={(enabled) => setAddon({ ...addon, enabled })}
                index={index}
                count={catalog.addons.length}
                onMove={(to) => update((current) => ({ ...current, addons: move(current.addons, index, to) }))}
                onRemove={
                  publishedIds.has(`addon:${addon.id}`)
                    ? undefined
                    : () => update((current) => ({ ...current, addons: current.addons.filter((_, i) => i !== index) }))
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Name"
                    value={addon.name}
                    onChange={(name) => setAddon({ ...addon, name })}
                  />
                  <MoneyInput label="Price" cents={addon.priceCents} onChange={(priceCents) => setAddon({ ...addon, priceCents })} />
                  <TextArea label="Description" rows={2} value={addon.description} onChange={(description) => setAddon({ ...addon, description })} className="sm:col-span-2" />
                </div>
              </ItemRow>
            );
          })}
        </ul>
        {catalog.addons.length < 50 && (
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              update((current) => ({
                ...current,
                addons: [
                  ...current.addons,
                  { id: makeId('New add-on', current.addons.map((item) => item.id)), name: 'New add-on', description: '', priceCents: 0, enabled: false },
                ],
              }))
            }
          >
            <PlusIcon /> Add add-on
          </Button>
        )}
      </Card>

      <Card
        title="Ceramic coating & paint correction"
        description="Offered on packages that allow ceramic coating. A coating can include a correction; upgrading charges the difference."
      >
        <ul className="space-y-2">
          {catalog.ceramicServices.map((service, index) => {
            const isPublished = publishedIds.has(`service:${service.id}`);
            return (
              <ItemRow
                key={service.id}
                title={service.name}
                meta={
                  <>
                    <span>{service.kind === 'coating' ? 'Coating' : 'Correction'}</span>
                    <span className="tabular">{formatCents(service.priceCents)}</span>
                  </>
                }
                enabled={service.enabled}
                onToggleEnabled={(enabled) => setService(index, { ...service, enabled })}
                index={index}
                count={catalog.ceramicServices.length}
                onMove={(to) => update((current) => ({ ...current, ceramicServices: move(current.ceramicServices, index, to) }))}
                onRemove={
                  isPublished || catalog.ceramicServices.some((item) => item.includedCorrectionId === service.id)
                    ? undefined
                    : () => update((current) => ({ ...current, ceramicServices: current.ceramicServices.filter((_, i) => i !== index) }))
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Name"
                    value={service.name}
                    onChange={(name) => setService(index, { ...service, name })}
                  />
                  <MoneyInput label="Price" cents={service.priceCents} onChange={(priceCents) => setService(index, { ...service, priceCents })} />
                  {!isPublished && (
                    <Field label="Type">
                      {({ id }) => (
                        <select
                          id={id}
                          value={service.kind}
                          className={inputClass}
                          onChange={(event) => {
                            const kind = event.target.value as CeramicService['kind'];
                            const next = { ...service, kind };
                            if (kind === 'correction') delete next.includedCorrectionId;
                            setService(index, next);
                          }}
                        >
                          <option value="coating">Coating</option>
                          <option value="correction">Paint correction</option>
                        </select>
                      )}
                    </Field>
                  )}
                  {service.kind === 'coating' && (
                    <Field label="Includes correction" hint="Its value is shown as included, and customers can upgrade for the difference.">
                      {({ id, describedBy }) => (
                        <select
                          id={id}
                          aria-describedby={describedBy}
                          value={service.includedCorrectionId ?? ''}
                          className={inputClass}
                          onChange={(event) => {
                            const next = { ...service, includedCorrectionId: event.target.value || undefined };
                            if (!next.includedCorrectionId) delete next.includedCorrectionId;
                            setService(index, next);
                          }}
                        >
                          <option value="">None</option>
                          {corrections.map((correction) => (
                            <option key={correction.id} value={correction.id}>
                              {correction.name} ({formatCents(correction.priceCents)})
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                  )}
                  <TextArea label="Description" rows={2} value={service.description} onChange={(description) => setService(index, { ...service, description })} className="sm:col-span-2" />
                  <TextInput
                    label="Note (optional)"
                    value={service.note ?? ''}
                    onChange={(note) => {
                      const { note: _previous, ...rest } = service;
                      setService(index, note ? { ...rest, note } : rest);
                    }}
                    className="sm:col-span-2"
                  />
                </div>
                <DurationInputs duration={service.duration} onChange={(duration) => setService(index, { ...service, duration })} />
                <p className="text-xs text-neutral-600">ID {service.id}</p>
              </ItemRow>
            );
          })}
        </ul>
        {catalog.ceramicServices.length < 30 && (
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              update((current) => ({
                ...current,
                ceramicServices: [
                  ...current.ceramicServices,
                  {
                    id: makeId('New correction', current.ceramicServices.map((item) => item.id)),
                    name: 'New correction',
                    description: '',
                    priceCents: 0,
                    enabled: false,
                    kind: 'correction',
                    duration: { minMinutes: 120, maxMinutes: 240 },
                  },
                ],
              }))
            }
          >
            <PlusIcon /> Add service
          </Button>
        )}
      </Card>

      <Card title="Scheduling" description="Bookings open your Cal.com calendar. Each category above picks its event.">
        <TextInput
          label="Cal.com username"
          hint={`Your booking page is cal.com/${catalog.calUsername}.`}
          value={catalog.calUsername}
          autoCapitalize="none"
          spellCheck={false}
          onChange={(calUsername) => update((current) => ({ ...current, calUsername: calUsername.trim().toLowerCase() }))}
        />
      </Card>
    </DocumentShell>
  );
}
