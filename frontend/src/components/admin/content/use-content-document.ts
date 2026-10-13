'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { describeApiError } from '@/lib/content/validation';
import type { AdminDocument, ContentRevisionSummary, ContentValue } from '@/lib/content/types';
import { useConfirm, useToast } from '../ui';
import { useUnsavedChanges } from '../unsaved-changes';

export class ContentApiError extends Error {
  constructor(message: string, readonly status: number, readonly body: unknown) {
    super(message);
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

/** Call the admin content proxy; throws ContentApiError with a readable message. */
export async function contentRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/content${path}`, {
      ...init,
      cache: 'no-store',
      signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new ContentApiError(
      timedOut ? 'The server took too long to respond. Try again.' : 'Could not reach the server. Check your connection and try again.',
      0,
      null,
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = response.status === 429 ? 'Too many changes in a short time. Wait a minute and try again.' : 'The request failed.';
    throw new ContentApiError(describeApiError(body, fallback), response.status, body);
  }
  return body as T;
}

export const documentPath = (key: string) => `/documents/${encodeURIComponent(key)}`;

export type PublishResponse<T extends ContentValue> = {
  document: AdminDocument<T>;
  affectedPaths: string[];
  cache?: { refreshed: boolean; paths: string[] };
};

export type DocumentStatus = 'unsaved' | 'unpublished' | 'pending' | 'live';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Local editing state for one content document. Edits stay in the browser
 * until saved; every write sends the last version seen, and a 409 becomes a
 * conflict the admin resolves explicitly instead of a silent overwrite.
 */
export function useContentDocument<T extends ContentValue>(key: string, label: string) {
  const confirm = useConfirm();
  const notify = useToast();
  const [doc, setDoc] = useState<AdminDocument<T> | null>(null);
  const [draft, setDraft] = useState<T | null>(null);
  const [busy, setBusy] = useState<'loading' | 'saving' | 'publishing' | 'restoring' | null>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const busyRef = useRef(false);

  const dirty = useMemo(() => Boolean(doc && draft && !same(draft, doc.draft)), [doc, draft]);
  useUnsavedChanges(key, dirty);

  const status: DocumentStatus | null = !doc
    ? null
    : dirty
      ? 'unsaved'
      : !doc.published
        ? 'unpublished'
        : !same(doc.draft, doc.published)
          ? 'pending'
          : 'live';

  const accept = useCallback((next: AdminDocument<T>, replaceDraft = true) => {
    setDoc(next);
    if (replaceDraft) setDraft(next.draft);
  }, []);

  const load = useCallback(async () => {
    setBusy('loading');
    setLoadError(null);
    try {
      accept(await contentRequest<AdminDocument<T>>(documentPath(key)));
      setConflict(false);
      setError(null);
    } catch (caught) {
      setLoadError(caught instanceof Error ? caught.message : 'Could not load this content.');
    } finally {
      setBusy(null);
    }
  }, [accept, key]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Run one write at a time, turning 409s into the conflict state. */
  const run = useCallback(
    async <R,>(kind: 'saving' | 'publishing' | 'restoring', action: () => Promise<R>): Promise<R | null> => {
      if (busyRef.current) return null;
      busyRef.current = true;
      setBusy(kind);
      setError(null);
      try {
        return await action();
      } catch (caught) {
        if (caught instanceof ContentApiError && caught.status === 409) {
          setConflict(true);
        } else {
          setError(caught instanceof Error ? caught.message : 'Something went wrong.');
        }
        return null;
      } finally {
        busyRef.current = false;
        setBusy(null);
      }
    },
    [],
  );

  const putDraft = useCallback(
    (version: number, value: T) =>
      contentRequest<AdminDocument<T>>(`${documentPath(key)}/draft`, {
        method: 'PUT',
        body: JSON.stringify({ expectedVersion: version, value }),
      }),
    [key],
  );

  const save = useCallback(async (): Promise<AdminDocument<T> | null> => {
    if (!doc || !draft) return null;
    if (!dirty) return doc;
    const saved = await run('saving', () => putDraft(doc.version, draft));
    if (saved) {
      // Keep typing that happened during the request.
      setDoc(saved);
      notify({ tone: 'success', message: `Saved ${label} draft. It is not public until you publish.` });
    }
    return saved;
  }, [dirty, doc, draft, label, notify, putDraft, run]);

  const publish = useCallback(async () => {
    if (!doc || !draft) return;
    const ok = await confirm({
      title: `Publish ${label}?`,
      body:
        key.startsWith('page:')
          ? 'Visitors will see this version of the page right away.'
          : 'This updates every page that shows these details, along with booking.',
      confirmLabel: 'Publish',
    });
    if (!ok) return;

    await run('publishing', async () => {
      let current = doc;
      if (dirty) current = await putDraft(doc.version, draft);
      setDoc(current);
      const result = await contentRequest<PublishResponse<T>>(`${documentPath(key)}/publish`, {
        method: 'POST',
        body: JSON.stringify({ expectedVersion: current.version }),
      });
      accept(result.document, false);
      // Publication may finish after the admin has started the next edit.
      setDraft((latest) => same(latest, draft) ? result.document.draft : latest);
      const pages = result.affectedPaths.length ? result.affectedPaths.join(', ') : 'no public pages';
      if (result.cache && !result.cache.refreshed) {
        notify({
          tone: 'warning',
          message: `Published ${label}, but the site cache could not be refreshed. Changes will show within about 5 minutes (${pages}).`,
        });
      } else {
        notify({ tone: 'success', message: `Published ${label}. Live now on ${pages}.` });
      }
    });
  }, [accept, confirm, dirty, doc, draft, key, label, notify, putDraft, run]);

  const discard = useCallback(async () => {
    if (!doc) return;
    const ok = await confirm({
      title: 'Discard unsaved changes?',
      body: 'Your edits since the last save will be lost.',
      confirmLabel: 'Discard',
      tone: 'danger',
    });
    if (ok) setDraft(doc.draft);
  }, [confirm, doc]);

  const restore = useCallback(
    async (revision: ContentRevisionSummary) => {
      if (!doc) return false;
      const ok = await confirm({
        title: `Restore version ${revision.version}?`,
        body: dirty
          ? 'Your unsaved edits will be replaced. The restored version goes into the draft; publish it to make it live.'
          : 'This copies it into the draft. Publish it to make it live.',
        confirmLabel: 'Restore to draft',
      });
      if (!ok) return false;
      const restored = await run('restoring', () =>
        contentRequest<AdminDocument<T>>(`${documentPath(key)}/restore`, {
          method: 'POST',
          body: JSON.stringify({ expectedVersion: doc.version, revisionId: revision.id }),
        }),
      );
      if (!restored) return false;
      accept(restored);
      notify({ tone: 'success', message: `Version ${revision.version} is now the draft. Review it, then publish.` });
      return true;
    },
    [accept, confirm, dirty, doc, key, notify, run],
  );

  /** Conflict: take the latest saved version and drop local edits. */
  const takeTheirs = useCallback(async () => {
    await load();
  }, [load]);

  /** Conflict: save local edits over the latest version, on purpose. */
  const keepMine = useCallback(async () => {
    if (!draft) return;
    const ok = await confirm({
      title: 'Replace the other changes?',
      body: 'The draft saved elsewhere will be replaced by what you see here. Published content is not affected until you publish.',
      confirmLabel: 'Save mine',
      tone: 'danger',
    });
    if (!ok) return;
    const saved = await run('saving', async () => {
      const latest = await contentRequest<AdminDocument<T>>(documentPath(key));
      return putDraft(latest.version, draft);
    });
    if (saved) {
      setDoc(saved);
      setConflict(false);
      notify({ tone: 'success', message: `Saved your version of ${label}.` });
    }
  }, [confirm, draft, key, label, notify, putDraft, run]);

  return {
    key,
    label,
    doc,
    draft,
    setDraft: setDraft as (update: T | ((current: T | null) => T | null)) => void,
    dirty,
    status,
    busy,
    loadError,
    error,
    clearError: () => setError(null),
    conflict,
    load,
    save,
    publish,
    discard,
    restore,
    takeTheirs,
    keepMine,
  };
}

export type ContentDocumentState<T extends ContentValue> = ReturnType<typeof useContentDocument<T>>;
