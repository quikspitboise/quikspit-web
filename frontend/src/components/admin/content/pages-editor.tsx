'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { pageKey, pagePath, type AdminDocumentSummary, type PageContent, type PageSection } from '@/lib/content/types';
import {
  ArrowIcon,
  Badge,
  Card,
  ChevronIcon,
  EyeIcon,
  IconButton,
  TextInput,
  cx,
  useConfirm,
} from '../ui';
import { useHasUnsavedChanges } from '../unsaved-changes';
import { DocumentShell } from './document-shell';
import { FieldsEditor, collectProblems } from './field-editors';
import { metadataFields } from './metadata-fields';
import { SECTION_LABELS, sectionFields, sectionSummary, type SchemaContext } from './section-schemas';
import { useContentDocument } from './use-content-document';

export type PageListItem = Pick<AdminDocumentSummary, 'key' | 'title' | 'hasUnpublishedChanges' | 'publishedAt'>;

function SectionCard({
  section,
  index,
  count,
  expanded,
  schema,
  onToggleExpanded,
  onChange,
  onMove,
}: {
  section: PageSection;
  index: number;
  count: number;
  expanded: boolean;
  schema: SchemaContext;
  onToggleExpanded: () => void;
  onChange: (next: PageSection) => void;
  onMove: (to: number) => void;
}) {
  const summary = sectionSummary(section);
  const label = SECTION_LABELS[section.type];
  const bodyId = `section-${section.id}`;

  return (
    <li
      className={cx(
        'rounded-xl border transition-colors',
        expanded ? 'border-white/20 bg-white/[0.02]' : 'border-white/[0.08]',
        !section.enabled && 'border-dashed',
      )}
    >
      <div className="flex items-center gap-1 pr-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={onToggleExpanded}
          className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 text-left"
        >
          <ChevronIcon direction={expanded ? 'up' : 'down'} className="h-4 w-4 shrink-0 text-neutral-500" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
              {label}
              {!section.enabled && <Badge tone="neutral" className="normal-case tracking-normal">Hidden</Badge>}
            </span>
            <span className={cx('block truncate font-medium', section.enabled ? 'text-white' : 'text-neutral-500')}>{summary}</span>
          </span>
        </button>
        <IconButton
          label={section.enabled ? `Hide ${summary}` : `Show ${summary}`}
          aria-pressed={!section.enabled}
          onClick={() => onChange({ ...section, enabled: !section.enabled })}
          className={section.enabled ? '' : 'text-amber-300'}
        >
          <EyeIcon off={!section.enabled} />
        </IconButton>
        <IconButton label={`Move ${summary} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowIcon direction="up" />
        </IconButton>
        <IconButton label={`Move ${summary} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowIcon direction="down" />
        </IconButton>
      </div>
      {expanded && (
        <div id={bodyId} className="border-t border-white/[0.06] p-3 sm:p-4">
          {!section.enabled && (
            <p className="mb-4 text-sm text-amber-200/80">Hidden from visitors. Its content is kept so you can show it again.</p>
          )}
          <FieldsEditor
            fields={sectionFields(section, schema)}
            value={section.fields}
            onChange={(fields) => onChange({ ...section, fields })}
          />
        </div>
      )}
    </li>
  );
}

function PageEditor({
  slug,
  title,
  currentUserId,
  schema,
  onPendingChange,
}: {
  slug: string;
  title: string;
  currentUserId: string;
  schema: SchemaContext;
  /** Reports whether the saved draft differs from what is published. */
  onPendingChange: (pending: boolean) => void;
}) {
  const state = useContentDocument<PageContent>(pageKey(slug), `the ${title} page`);
  const { doc } = state;
  useEffect(() => {
    if (doc) onPendingChange(JSON.stringify(doc.draft) !== JSON.stringify(doc.published));
  }, [doc, onPendingChange]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const page = state.draft;

  const metaSpecs = useMemo(
    () => metadataFields({ titleHint: slug === 'home' ? 'The home page shows the site title from Business & site in browser tabs.' : undefined }),
    [slug],
  );
  const problems = useMemo(() => {
    if (!page) return [];
    return [
      ...collectProblems(metaSpecs, page.metadata as Record<string, unknown>, 'Search & sharing'),
      ...page.sections.flatMap((section) =>
        collectProblems(sectionFields(section, { ...schema, slug }), section.fields, `${SECTION_LABELS[section.type]} “${sectionSummary(section)}”`),
      ),
    ];
  }, [metaSpecs, page, schema, slug]);

  const update = (change: (current: PageContent) => PageContent) =>
    state.setDraft((current) => (current ? change(current) : current));

  const updateSection = (next: PageSection) =>
    update((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === next.id ? next : section)),
    }));

  const moveSection = (from: number, to: number) =>
    update((current) => {
      if (to < 0 || to >= current.sections.length) return current;
      const sections = [...current.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...current, sections };
    });

  return (
    <DocumentShell
      state={state}
      currentUserId={currentUserId}
      previewTargets={[{ slug, label: title }]}
      problems={problems}
    >
      {page && (
        <>
          <Card
            title={page.title || title}
            description={
              <>
                Address{' '}
                <a href={pagePath(slug)} target="_blank" rel="noopener" className="text-neutral-200 underline underline-offset-2 hover:text-white">
                  {pagePath(slug)}
                </a>
              </>
            }
          >
            <div className="space-y-4">
              <TextInput
                label="Page name"
                hint="Used in the admin and as the page’s heading when a header has none."
                value={page.title}
                onChange={(value) => update((current) => ({ ...current, title: value }))}
              />
              <div className="rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  aria-expanded={showSeo}
                  onClick={() => setShowSeo((open) => !open)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-3 text-left text-sm"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-neutral-200">Search & sharing</span>
                    <span className="block truncate text-xs text-neutral-500">{page.metadata.title} — {page.metadata.description}</span>
                  </span>
                  <ChevronIcon direction={showSeo ? 'up' : 'down'} className="h-4 w-4 shrink-0 text-neutral-500" />
                </button>
                {showSeo && (
                  <div className="border-t border-white/[0.06] p-3 sm:p-4">
                    <FieldsEditor
                      fields={metaSpecs}
                      value={page.metadata as Record<string, unknown>}
                      onChange={(metadata) => update((current) => ({ ...current, metadata: metadata as PageContent['metadata'] }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card
            title="Sections"
            description="Tap a section to edit it. Use the eye to hide or show it, and the arrows to change the order."
          >
            <ol className="space-y-2">
              {page.sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  count={page.sections.length}
                  expanded={expanded === section.id}
                  schema={{ ...schema, slug }}
                  onToggleExpanded={() => setExpanded((current) => (current === section.id ? null : section.id))}
                  onChange={updateSection}
                  onMove={(to) => moveSection(index, to)}
                />
              ))}
            </ol>
          </Card>
        </>
      )}
    </DocumentShell>
  );
}

const PAGE_ORDER = ['home', 'pricing', 'booking', 'gallery', 'about', 'contact'];

export function PagesEditor({
  pages,
  currentUserId,
  priceSources,
}: {
  pages: PageListItem[];
  currentUserId: string;
  priceSources: SchemaContext['priceSources'];
}) {
  const confirm = useConfirm();
  const sorted = useMemo(
    () =>
      [...pages].sort((a, b) => {
        const rank = (key: string) => {
          const index = PAGE_ORDER.indexOf(key.slice(5));
          return index === -1 ? PAGE_ORDER.length : index;
        };
        return rank(a.key) - rank(b.key) || a.title.localeCompare(b.title);
      }),
    [pages],
  );
  const [selected, setSelected] = useState(sorted[0]?.key.slice(5) ?? 'home');
  const hasUnsaved = useHasUnsavedChanges(pageKey(selected));
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const current = sorted.find((page) => page.key === pageKey(selected));
  const onPendingChange = useCallback(
    (value: boolean) => setPending((map) => (map[selected] === value ? map : { ...map, [selected]: value })),
    [selected],
  );

  const select = async (slug: string) => {
    if (slug === selected) return;
    if (hasUnsaved && !(await confirm({
      title: 'Leave without saving?',
      body: 'This page has unsaved changes. They will be lost if you switch pages.',
      confirmLabel: 'Discard and switch',
      tone: 'danger',
    }))) return;
    setSelected(slug);
  };

  if (sorted.length === 0) {
    return <p className="text-neutral-400">No pages yet. Run the content migration on the backend first.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <nav aria-label="Pages" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <ul className="flex gap-2 lg:sticky lg:top-[calc(var(--nav-total-height)+5rem)] lg:flex-col lg:gap-1">
          {sorted.map((page) => {
            const slug = page.key.slice(5);
            const active = slug === selected;
            return (
              <li key={page.key} className="shrink-0">
                <button
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => select(slug)}
                  className={cx(
                    'flex min-h-11 w-full items-center gap-2 rounded-full border px-4 text-left text-sm transition-colors lg:rounded-lg lg:border-transparent lg:px-3',
                    active ? 'border-red-500/60 bg-red-600/10 text-white lg:bg-white/[0.06]' : 'border-white/10 text-neutral-300 hover:text-white lg:hover:bg-white/[0.03]',
                  )}
                >
                  <span className="truncate">{page.title}</span>
                  {(pending[slug] ?? page.hasUnpublishedChanges) && (
                    <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-sky-400" aria-label="has unpublished changes" title="Has unpublished changes" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        <PageEditor
          key={selected}
          slug={selected}
          title={current?.title ?? selected}
          currentUserId={currentUserId}
          schema={{ slug: selected, priceSources }}
          onPendingChange={onPendingChange}
        />
      </div>
    </div>
  );
}
