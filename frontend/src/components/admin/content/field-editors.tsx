'use client';

import { useId, useState, type ReactNode } from 'react';
import { asLink } from '@/lib/content/fields';
import { LINK_HINT, linkError } from '@/lib/content/validation';
import {
  ArrowIcon,
  Button,
  ChevronIcon,
  Field,
  IconButton,
  PlusIcon,
  Switch,
  TextArea,
  TextInput,
  TrashIcon,
  cx,
  inputClass,
} from '../ui';

type Value = Record<string, unknown>;

/** Declarative description of an editable field inside free-form JSON. */
export type FieldSpec =
  | { kind: 'text'; key: string; label: string; hint?: ReactNode; multiline?: boolean; placeholder?: string }
  | { kind: 'url'; key: string; label: string; hint?: ReactNode; required?: boolean; placeholder?: string }
  | { kind: 'textList'; key: string; label: string; hint?: ReactNode; itemLabel: string; multiline?: boolean }
  | { kind: 'link'; key: string; label: string; hint?: ReactNode; optional?: boolean }
  | { kind: 'boolean'; key: string; label: string; hint?: ReactNode }
  | { kind: 'select'; key: string; label: string; hint?: ReactNode; options: { value: string; label: string }[]; optional?: boolean }
  | { kind: 'objectList'; key: string; label: string; hint?: ReactNode; itemLabel: string; fields: FieldSpec[]; summaryKey?: string }
  | { kind: 'group'; key: string; label: string; hint?: ReactNode; fields: FieldSpec[] }
  | { kind: 'note'; text: ReactNode }
  /** Escape hatch for a control that reads or writes several keys. */
  | { kind: 'custom'; id: string; render: (value: Value, onChange: (next: Value) => void) => ReactNode };

const asString = (value: unknown) => (typeof value === 'string' ? value : '');
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);
const asObject = (value: unknown): Value => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Value) : {});

function without(value: Value, key: string): Value {
  const next = { ...value };
  delete next[key];
  return next;
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function emptyValue(fields: FieldSpec[]): Value {
  const value: Value = {};
  for (const field of fields) {
    if (field.kind === 'text' || (field.kind === 'url' && field.required)) value[field.key] = '';
    if (field.kind === 'textList') value[field.key] = [];
    if (field.kind === 'boolean') value[field.key] = false;
    if (field.kind === 'link' && !field.optional) value[field.key] = { label: '', href: '' };
  }
  return value;
}

/** Problems that would make the backend reject the value, with field labels. */
export function collectProblems(fields: FieldSpec[], value: Value, prefix = ''): string[] {
  return fields.flatMap((field) => {
    if (field.kind === 'note' || field.kind === 'custom') return [];
    const label = prefix ? `${prefix} › ${field.label}` : field.label;
    const current = value[field.key];
    if (field.kind === 'link') {
      const link = current as { label?: string; href?: string } | undefined;
      if (!link) return field.optional ? [] : [`${label}: add a link`];
      if (!asString(link.label).trim()) return [`${label}: add button text`];
      const error = linkError(asString(link.href));
      return error ? [`${label}: ${error}`] : [];
    }
    if (field.kind === 'url') {
      const error = current === undefined && !field.required ? null : linkError(asString(current));
      return error ? [`${label}: ${error}`] : [];
    }
    if (field.kind === 'objectList') {
      return asArray(current).flatMap((item, index) =>
        collectProblems(field.fields, asObject(item), `${label} ${index + 1}`),
      );
    }
    if (field.kind === 'group') return collectProblems(field.fields, asObject(current), label);
    return [];
  });
}

function LinkEditor({ spec, value, onChange }: {
  spec: Extract<FieldSpec, { kind: 'link' }>;
  value: unknown;
  onChange: (next: { label: string; href: string } | undefined) => void;
}) {
  const link = value && typeof value === 'object' ? (value as { label?: string; href?: string }) : undefined;
  const [touched, setTouched] = useState(false);

  if (!link) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-neutral-200">{spec.label}</p>
        <Button size="sm" onClick={() => onChange({ label: '', href: '' })}>
          <PlusIcon /> Add {spec.label.toLowerCase()}
        </Button>
      </div>
    );
  }

  const href = asString(link.href);
  const error = touched || href ? linkError(href) : null;
  return (
    <fieldset className="rounded-xl border border-white/[0.08] p-3">
      <legend className="flex w-full items-center justify-between gap-2 px-1 text-sm font-medium text-neutral-200">
        {spec.label}
      </legend>
      {spec.hint && <p className="mb-3 text-xs text-neutral-500">{spec.hint}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label="Text" value={asString(link.label)} onChange={(label) => onChange({ label, href })} />
        <TextInput
          label="Goes to"
          value={href}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="/booking"
          error={error}
          onBlur={() => setTouched(true)}
          onChange={(nextHref) => onChange({ label: asString(link.label), href: nextHref.trim() })}
        />
      </div>
      {spec.optional && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-2 rounded px-1 py-1 text-xs text-neutral-400 underline underline-offset-2 hover:text-white"
        >
          Remove {spec.label.toLowerCase()}
        </button>
      )}
    </fieldset>
  );
}

function TextListEditor({ spec, value, onChange }: {
  spec: Extract<FieldSpec, { kind: 'textList' }>;
  value: unknown;
  onChange: (next: string[]) => void;
}) {
  const items = asArray(value).map(asString);
  const idBase = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-medium text-neutral-200">{spec.label}</legend>
      {spec.hint && <p className="-mt-1 mb-2 text-xs text-neutral-500">{spec.hint}</p>}
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor={`${idBase}-${index}`}>{`${spec.itemLabel} ${index + 1}`}</label>
            {spec.multiline ? (
              <textarea
                id={`${idBase}-${index}`}
                value={item}
                rows={2}
                onChange={(event) => onChange(items.map((entry, i) => (i === index ? event.target.value : entry)))}
                className={cx(inputClass, 'field-sizing-content min-h-16 resize-y leading-relaxed')}
              />
            ) : (
              <input
                id={`${idBase}-${index}`}
                value={item}
                onChange={(event) => onChange(items.map((entry, i) => (i === index ? event.target.value : entry)))}
                className={inputClass}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col sm:flex-row">
            <IconButton label={`Move ${spec.itemLabel.toLowerCase()} ${index + 1} up`} disabled={index === 0} onClick={() => onChange(move(items, index, index - 1))} className="h-9 w-9 sm:h-11 sm:w-11">
              <ArrowIcon direction="up" />
            </IconButton>
            <IconButton label={`Move ${spec.itemLabel.toLowerCase()} ${index + 1} down`} disabled={index === items.length - 1} onClick={() => onChange(move(items, index, index + 1))} className="h-9 w-9 sm:h-11 sm:w-11">
              <ArrowIcon direction="down" />
            </IconButton>
          </div>
          <IconButton label={`Remove ${spec.itemLabel.toLowerCase()} ${index + 1}`} onClick={() => onChange(items.filter((_, i) => i !== index))} className="hover:text-red-300">
            <TrashIcon />
          </IconButton>
        </div>
      ))}
      <Button size="sm" onClick={() => onChange([...items, ''])}>
        <PlusIcon /> Add {spec.itemLabel.toLowerCase()}
      </Button>
    </fieldset>
  );
}

function ObjectListEditor({ spec, value, onChange }: {
  spec: Extract<FieldSpec, { kind: 'objectList' }>;
  value: unknown;
  onChange: (next: Value[]) => void;
}) {
  const items = asArray(value).map(asObject);
  const [open, setOpen] = useState<number | null>(null);
  const summaryKey = spec.summaryKey ?? spec.fields.find((field) => field.kind === 'text')?.key;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-medium text-neutral-200">{spec.label}</legend>
      {spec.hint && <p className="-mt-1 mb-2 text-xs text-neutral-500">{spec.hint}</p>}
      {items.map((item, index) => {
        const expanded = open === index;
        const summary = (summaryKey && asString(item[summaryKey])) || `${spec.itemLabel} ${index + 1}`;
        return (
          <div key={index} className="rounded-xl border border-white/[0.08] bg-white/[0.015]">
            <div className="flex items-center gap-1 pr-1">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 text-left text-sm"
              >
                <ChevronIcon direction={expanded ? 'up' : 'down'} className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="truncate text-neutral-200">{summary}</span>
              </button>
              <IconButton label={`Move ${summary} up`} disabled={index === 0} onClick={() => { onChange(move(items, index, index - 1)); setOpen(null); }}>
                <ArrowIcon direction="up" />
              </IconButton>
              <IconButton label={`Move ${summary} down`} disabled={index === items.length - 1} onClick={() => { onChange(move(items, index, index + 1)); setOpen(null); }}>
                <ArrowIcon direction="down" />
              </IconButton>
              <IconButton label={`Remove ${summary}`} onClick={() => { onChange(items.filter((_, i) => i !== index)); setOpen(null); }} className="hover:text-red-300">
                <TrashIcon />
              </IconButton>
            </div>
            {expanded && (
              <div className="border-t border-white/[0.06] p-3">
                <FieldsEditor fields={spec.fields} value={item} onChange={(next) => onChange(items.map((entry, i) => (i === index ? next : entry)))} />
              </div>
            )}
          </div>
        );
      })}
      <Button
        size="sm"
        onClick={() => {
          onChange([...items, emptyValue(spec.fields)]);
          setOpen(items.length);
        }}
      >
        <PlusIcon /> Add {spec.itemLabel.toLowerCase()}
      </Button>
    </fieldset>
  );
}

/** Edits the listed keys of `value`, leaving any other keys untouched. */
export function FieldsEditor({ fields, value, onChange }: { fields: FieldSpec[]; value: Value; onChange: (next: Value) => void }) {
  const set = (key: string, next: unknown) => onChange(next === undefined ? without(value, key) : { ...value, [key]: next });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        switch (field.kind) {
          case 'custom':
            return <div key={field.id}>{field.render(value, onChange)}</div>;
          case 'note':
            return (
              <p key={index} className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-neutral-400">
                {field.text}
              </p>
            );
          case 'text':
            return field.multiline ? (
              <TextArea key={field.key} label={field.label} hint={field.hint} placeholder={field.placeholder} value={asString(value[field.key])} onChange={(next) => set(field.key, next)} />
            ) : (
              <TextInput key={field.key} label={field.label} hint={field.hint} placeholder={field.placeholder} value={asString(value[field.key])} onChange={(next) => set(field.key, next)} />
            );
          case 'url': {
            const current = asString(value[field.key]);
            return (
              <TextInput
                key={field.key}
                label={field.label}
                hint={field.hint ?? LINK_HINT}
                placeholder={field.placeholder}
                value={current}
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                error={current ? linkError(current) : null}
                onChange={(next) => set(field.key, next.trim() || (field.required ? '' : undefined))}
              />
            );
          }
          case 'boolean':
            return (
              <Switch key={field.key} label={field.label} description={field.hint} checked={value[field.key] === true} onChange={(next) => set(field.key, next)} />
            );
          case 'select':
            return (
              <Field key={field.key} label={field.label} hint={field.hint}>
                {({ id, describedBy }) => (
                  <select
                    id={id}
                    aria-describedby={describedBy}
                    value={asString(value[field.key])}
                    onChange={(event) => set(field.key, event.target.value || undefined)}
                    className={inputClass}
                  >
                    {field.optional && <option value="">None</option>}
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
              </Field>
            );
          case 'link':
            return <LinkEditor key={field.key} spec={field} value={asLink(value[field.key]) ?? value[field.key]} onChange={(next) => set(field.key, next)} />;
          case 'textList':
            return <TextListEditor key={field.key} spec={field} value={value[field.key]} onChange={(next) => set(field.key, next)} />;
          case 'objectList':
            return <ObjectListEditor key={field.key} spec={field} value={value[field.key]} onChange={(next) => set(field.key, next)} />;
          case 'group':
            return (
              <fieldset key={field.key} className="space-y-3 rounded-xl border border-white/[0.08] p-3 sm:p-4">
                <legend className="px-1 text-sm font-semibold text-white">{field.label}</legend>
                {field.hint && <p className="text-xs text-neutral-500">{field.hint}</p>}
                <FieldsEditor fields={field.fields} value={asObject(value[field.key])} onChange={(next) => set(field.key, next)} />
              </fieldset>
            );
        }
      })}
    </div>
  );
}
