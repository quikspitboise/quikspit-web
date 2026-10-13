'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { ContentRevisionSummary, ContentValue } from '@/lib/content/types';
import { contentProblems } from '@/lib/content/validation';
import {
  Badge,
  Button,
  ExternalIcon,
  EyeIcon,
  IconButton,
  Notice,
  SegmentedControl,
  Sheet,
  Spinner,
  cx,
  inputClass,
  type BadgeTone,
} from '../ui';
import { contentRequest, documentPath, type ContentDocumentState, type DocumentStatus } from './use-content-document';

const DraftInputProblems = createContext<((id: string, problem: string | null) => void) | null>(null);

/** Include invalid local text that has not yet produced a draft value. */
export function useDraftInputProblem(problem: string | null) {
  const id = useId();
  const report = useContext(DraftInputProblems);
  useEffect(() => {
    report?.(id, problem);
    return () => report?.(id, null);
  }, [id, problem, report]);
}

const STATUS: Record<DocumentStatus, { tone: BadgeTone; label: string; short: string; detail: string }> = {
  unsaved: { tone: 'warning', label: 'Unsaved changes', short: 'Unsaved', detail: 'Save to keep them, or publish to make them live.' },
  pending: { tone: 'info', label: 'Draft saved', short: 'Draft', detail: 'Visitors still see the published version.' },
  unpublished: { tone: 'neutral', label: 'Not published', short: 'Not live', detail: 'This is not visible to visitors yet.' },
  live: { tone: 'success', label: 'Published', short: 'Live', detail: 'Visitors see exactly this.' },
};

function UndoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={cx('fill-none stroke-current', className)} viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
    </svg>
  );
}

export type PreviewTarget = { slug: string; label: string };

function HistoryIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={cx('fill-none stroke-current', className)} viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </svg>
  );
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
export const formatDate = (value: string) => dateFormat.format(new Date(value));

function HistorySheet<T extends ContentValue>({
  open,
  onClose,
  state,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  state: ContentDocumentState<T>;
  currentUserId: string;
}) {
  const [revisions, setRevisions] = useState<ContentRevisionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (nextPage: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const data = await contentRequest<{ revisions: ContentRevisionSummary[]; total: number }>(
          `${documentPath(state.key)}/revisions?page=${nextPage}&limit=20`,
        );
        setRevisions((current) => [...new Map(
          [...(nextPage === 1 ? [] : current), ...data.revisions].map((revision) => [revision.id, revision]),
        ).values()]);
        setTotal(data.total);
        setPage(nextPage);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not load history.');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [state.key],
  );

  useEffect(() => {
    if (open) void loadPage(1);
  }, [open, loadPage]);

  const liveId = state.doc?.publishedRevisionId;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Publishing history"
      description="Each publish is kept. Restoring copies a version into the draft so you can check it before publishing."
    >
      {error && <Notice tone="danger" className="mb-4">{error}</Notice>}
      {!loading && revisions.length === 0 && !error && (
        <p className="text-sm text-neutral-400">Nothing has been published from the editor yet.</p>
      )}
      <ol className="space-y-2">
        {revisions.map((revision) => (
          <li key={revision.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white">Version {revision.version}</span>
                {revision.action === 'unpublish' ? (
                  <Badge tone="neutral">Unpublished</Badge>
                ) : revision.id === liveId ? (
                  <Badge tone="success">Live now</Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-neutral-400">
                {formatDate(revision.createdAt)} ·{' '}
                {revision.createdByUserId === currentUserId ? 'you' : 'another admin'}
              </p>
            </div>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={state.busy !== null}
              onClick={async () => {
                if (await state.restore(revision)) onClose();
              }}
            >
              Restore to draft
            </Button>
          </li>
        ))}
      </ol>
      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-neutral-400" role="status">
          <Spinner /> Loading history…
        </p>
      )}
      {!loading && revisions.length < total && (
        <Button className="mt-4 w-full" onClick={() => loadPage(page + 1)}>
          Show older versions
        </Button>
      )}
    </Sheet>
  );
}

function PreviewSheet({
  open,
  onClose,
  targets,
  initialSlug,
  nonce,
}: {
  open: boolean;
  onClose: () => void;
  targets: PreviewTarget[];
  initialSlug: string;
  nonce: number;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [device, setDevice] = useState<'phone' | 'desktop'>('desktop');
  const [loaded, setLoaded] = useState(false);
  const selectId = useId();
  const src = `/admin/preview/${slug}`;

  useEffect(() => {
    if (open) setLoaded(false);
  }, [open, slug, nonce]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="full"
      bodyClassName="flex flex-col overflow-hidden"
      title="Preview"
      description="Saved drafts of this page, business details, and prices, shown as visitors would see them after publishing."
    >
      <>
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2 sm:px-6">
          {targets.length > 1 && (
            <>
              <label htmlFor={selectId} className="sr-only">Page to preview</label>
              <select id={selectId} value={slug} onChange={(event) => setSlug(event.target.value)} className={cx(inputClass, 'w-auto min-w-40 py-2')}>
                {targets.map((target) => (
                  <option key={target.slug} value={target.slug}>{target.label}</option>
                ))}
              </select>
            </>
          )}
          <SegmentedControl
            label="Preview width"
            className="max-sm:hidden"
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', label: 'Desktop' },
              { value: 'phone', label: 'Phone' },
            ]}
          />
          <a
            href={src}
            target="_blank"
            rel="noopener"
            className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-300 hover:bg-white/[0.06] hover:text-white"
          >
            Open in new tab <ExternalIcon />
          </a>
        </div>
        <div className="relative min-h-0 flex-1 bg-neutral-900">
          {!loaded && (
            <p className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-neutral-400" role="status">
              <Spinner /> Loading preview…
            </p>
          )}
          {open && (
            <iframe
              key={`${slug}-${nonce}`}
              title="Draft preview"
              src={src}
              onLoad={() => setLoaded(true)}
              className={cx(
                'mx-auto block h-full border-0 bg-black transition-[width]',
                device === 'phone' ? 'w-full sm:w-[390px] sm:border-x sm:border-white/10' : 'w-full',
              )}
            />
          )}
        </div>
      </>
    </Sheet>
  );
}

/**
 * Frame shared by the content editors: loading and conflict states, plus a
 * sticky bar with status, save, preview, history, and publish.
 */
export function DocumentShell<T extends ContentValue>({
  state,
  currentUserId,
  previewTargets,
  problems = [],
  children,
}: {
  state: ContentDocumentState<T>;
  currentUserId: string;
  previewTargets: PreviewTarget[];
  /** Field problems the backend would reject; saving waits until they are fixed. */
  problems?: string[];
  children: ReactNode;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [inputProblems, setInputProblems] = useState<Record<string, string>>({});
  const reportInputProblem = useCallback((id: string, problem: string | null) => {
    setInputProblems((current) => {
      if ((current[id] ?? null) === problem) return current;
      const next = { ...current };
      if (problem === null) delete next[id];
      else next[id] = problem;
      return next;
    });
  }, []);
  const { doc, draft, status, busy, dirty } = state;

  const allProblems = [...new Set([...problems, ...Object.values(inputProblems), ...(doc && draft ? contentProblems(doc.kind, draft) : [])])];
  const blocked = allProblems.length > 0;
  const openPreview = async () => {
    // Preview renders saved drafts, so save pending edits first.
    if (dirty && (blocked || !(await state.save()))) return;
    setPreviewNonce((n) => n + 1);
    setPreviewOpen(true);
  };

  const { save } = state;
  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (dirty && !blocked) void save();
    }
  };

  if (!doc || !draft) {
    return state.loadError ? (
      <Notice tone="danger" actions={<Button onClick={() => state.load()}>Try again</Button>}>
        {state.loadError}
      </Notice>
    ) : (
      <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-neutral-400" role="status">
        <Spinner /> Loading…
      </div>
    );
  }

  const info = status ? STATUS[status] : null;
  const canPublish = status !== 'live';

  return (
    <DraftInputProblems.Provider value={reportInputProblem}>
    <div onKeyDown={onKeyDown}>
      <div className="space-y-4 sm:space-y-6">{children}</div>

      {blocked && (
        <Notice tone="danger" className="mt-6">
          <p className="font-semibold">Fix {allProblems.length === 1 ? 'this' : 'these'} before saving:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {allProblems.slice(0, 6).map((problem) => <li key={problem}>{problem}</li>)}
          </ul>
        </Notice>
      )}

      {/* Conflicts and errors sit with the actions, so they are seen wherever the admin has scrolled. */}
      <div className="sticky bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 mt-6 space-y-2">
        {(state.conflict || state.error) && (
          <div className="space-y-2 rounded-xl bg-neutral-950 shadow-2xl shadow-black">
            {state.conflict && (
              <Notice
                tone="warning"
                actions={
                  <>
                    <Button size="sm" onClick={() => state.takeTheirs()}>Load the latest version</Button>
                    <Button size="sm" variant="ghost" onClick={() => state.keepMine()} disabled={blocked || busy !== null}>Save mine anyway</Button>
                  </>
                }
              >
                <strong className="font-semibold">{state.label} changed somewhere else</strong> (another tab or admin) since you opened it.
                Loading the latest version drops your unsaved edits here. Saving yours replaces theirs.
              </Notice>
            )}
            {state.error && (
              <Notice tone="danger" actions={<Button size="sm" variant="ghost" onClick={state.clearError}>Dismiss</Button>}>
                {state.error}
              </Notice>
            )}
          </div>
        )}

        {/* One row on phones too, so it stays short and clear of toasts. */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-neutral-950/95 px-2 py-2 shadow-2xl shadow-black backdrop-blur sm:gap-2 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-1 text-sm" title={info?.detail}>
            {info && (
              <Badge tone={info.tone}>
                <span className="sm:hidden">{info.short}</span>
                <span className="max-sm:hidden">{info.label}</span>
              </Badge>
            )}
            <span className="hidden truncate text-neutral-500 lg:inline">{info?.detail}</span>
          </div>
          {dirty && (
            <>
              <IconButton label="Discard unsaved changes" onClick={() => state.discard()} disabled={busy !== null} className="sm:hidden">
                <UndoIcon />
              </IconButton>
              <Button variant="ghost" onClick={() => state.discard()} disabled={busy !== null} className="max-sm:hidden">
                Discard
              </Button>
            </>
          )}
          <IconButton label={dirty ? 'Save & preview' : 'Preview'} onClick={openPreview} disabled={busy !== null || (dirty && blocked)} className="sm:hidden">
            <EyeIcon />
          </IconButton>
          {!dirty && (
            <IconButton label="Publishing history" onClick={() => setHistoryOpen(true)} className="sm:hidden">
              <HistoryIcon />
            </IconButton>
          )}
          <Button variant="ghost" onClick={() => setHistoryOpen(true)} className="max-sm:hidden">
            History
          </Button>
          <Button variant="ghost" onClick={openPreview} disabled={busy !== null || (dirty && blocked)} className="max-sm:hidden">
            {dirty ? 'Save & preview' : 'Preview'}
          </Button>
          <Button onClick={() => state.save()} disabled={!dirty || blocked || busy !== null}>
            {busy === 'saving' && <Spinner />}
            {busy === 'saving' ? 'Saving' : <>Save<span className="max-sm:hidden">draft</span></>}
          </Button>
          <Button variant="primary" onClick={() => state.publish()} disabled={!canPublish || blocked || busy !== null}>
            {busy === 'publishing' && <Spinner />}
            {busy === 'publishing' ? 'Publishing' : 'Publish'}
          </Button>
        </div>
      </div>

      <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)} state={state} currentUserId={currentUserId} />
      {previewTargets.length > 0 && (
        <PreviewSheet
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          targets={previewTargets}
          initialSlug={previewTargets[0].slug}
          nonce={previewNonce}
        />
      )}
    </div>
    </DraftInputProblems.Provider>
  );
}
