'use client';

import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import { CldImage } from 'next-cloudinary';
import { GlassCard } from '@/components/ui/glass-card';
import type { GalleryAdminItem, GalleryAssetType } from '@/lib/gallery';
import {
  assertImageFile,
  IMAGE_ACCEPT,
  uploadFileToCloudinary,
  type UploadSignatureResponse,
} from '@/lib/cloudinary-upload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type GalleryAdminClientProps = {
  initialItems: GalleryAdminItem[];
};

type FeedbackState = {
  tone: 'success' | 'error';
  message: string;
} | null;

type MetadataDraft = {
  categories: string;
  tags: string;
};

const MUTATION_TIMEOUT_MS = 20_000;

function sortItems(items: GalleryAdminItem[]): GalleryAdminItem[] {
  return [...items].sort((left, right) => left.displayOrder - right.displayOrder);
}

function buildDraft(item: GalleryAdminItem): MetadataDraft {
  return {
    categories: item.categories.join(', '),
    tags: item.tags.join(', '),
  };
}

function parseCommaSeparatedValues(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildDraftMap(items: GalleryAdminItem[]): Record<string, MetadataDraft> {
  return Object.fromEntries(items.map((item) => [item.id, buildDraft(item)]));
}

async function fetchAdminRequest(
  input: RequestInfo | URL,
  init: RequestInit,
  signal: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, MUTATION_TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  signal.addEventListener('abort', abortRequest, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new Error('The request timed out.');
    if (signal.aborted) throw new Error('Operation cancelled.');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    signal.removeEventListener('abort', abortRequest);
  }
}

async function fetchUploadSignature(signal: AbortSignal): Promise<UploadSignatureResponse> {
  const response = await fetchAdminRequest('/api/admin/gallery/upload-signature', {
    method: 'POST',
  }, signal);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error || 'Unable to sign Cloudinary upload.');
  }

  return response.json() as Promise<UploadSignatureResponse>;
}

/* ─── Card Thumbnail (compact, for grid view) ─────────────── */
function CardThumbnail({ item }: { item: GalleryAdminItem }) {
  const itemAlt = item.altText || item.title;

  if (item.assetType === 'comparison') {
    return (
      <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
        <div className="grid grid-cols-2 h-full">
          <div className="relative overflow-hidden">
            {item.beforeUrl ? (
              <CldImage
                src={item.beforeUrl}
                alt={`${itemAlt} before`}
                fill
                sizes="200px"
                crop="fill"
                gravity="auto"
                format="auto"
                quality="auto"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-neutral-950 text-xs text-neutral-600">No image</div>
            )}
            <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">Before</span>
          </div>
          <div className="relative overflow-hidden border-l border-white/10">
            {item.afterUrl ? (
              <CldImage
                src={item.afterUrl}
                alt={`${itemAlt} after`}
                fill
                sizes="200px"
                crop="fill"
                gravity="auto"
                format="auto"
                quality="auto"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-neutral-950 text-xs text-neutral-600">No image</div>
            )}
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">After</span>
          </div>
        </div>
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-red-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white tracking-wide uppercase">
          B&amp;A
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
      {item.imageUrl ? (
        <CldImage
          src={item.imageUrl}
          alt={itemAlt}
          fill
          sizes="300px"
          crop="fill"
          gravity="auto"
          format="auto"
          quality="auto"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-neutral-950 text-xs text-neutral-600">
          No image uploaded
        </div>
      )}
    </div>
  );
}

/* ─── Sortable Card ──────────────────────────────────────────── */
function SortableGalleryCard({
  item,
  expandedId,
  onToggleExpand,
  busyKey,
  drafts,
  onUpdateLocalItem,
  onUpdateDraft,
  onMetadataSave,
  onDelete,
  onReplaceAssets,
  onCancel,
  uploadProgress,
}: {
  item: GalleryAdminItem;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  busyKey: string | null;
  drafts: Record<string, MetadataDraft>;
  onUpdateLocalItem: (id: string, changes: Partial<GalleryAdminItem>) => void;
  onUpdateDraft: (id: string, changes: Partial<MetadataDraft>) => void;
  onMetadataSave: (item: GalleryAdminItem) => void;
  onDelete: (item: GalleryAdminItem) => void;
  onReplaceAssets: (event: FormEvent<HTMLFormElement>, item: GalleryAdminItem) => void;
  onCancel: () => void;
  uploadProgress: number | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  const isExpanded = expandedId === item.id;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'relative' : ''}>
      <div className={`group overflow-hidden rounded-2xl border ${isDragging ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-white/6'} bg-neutral-900/60 backdrop-blur-sm transition-colors`}>
        {/* Drag handle + thumbnail */}
        <div className="relative">
          <CardThumbnail item={item} />

          {/* Drag handle overlay */}
          <button
            type="button"
            className="absolute top-2 right-2 z-10 cursor-grab rounded-lg bg-black/60 backdrop-blur-sm p-1.5 text-white/60 hover:text-white hover:bg-black/80 transition active:cursor-grabbing"
            aria-label={`Drag to reorder ${item.title}`}
            {...attributes}
            {...listeners}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Card info bar */}
        <div className="px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-red-400 mb-0.5">
            {item.assetType === 'comparison' ? 'Comparison' : 'Single'}
          </p>
          <h3 className="font-display text-sm text-white tracking-wide truncate" title={item.title}>
            {item.title}
          </h3>
          {item.categories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400">
                  {cat}
                </span>
              ))}
              {item.categories.length > 3 && (
                <span className="text-[10px] text-neutral-500">+{item.categories.length - 3}</span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => onToggleExpand(item.id)}
            aria-expanded={isExpanded}
            aria-controls={`gallery-edit-${item.id}`}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-neutral-400 transition hover:border-white/15 hover:text-white"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
            {isExpanded ? 'Collapse' : 'Edit'}
          </button>
        </div>

        {/* Expanded edit panel */}
        {isExpanded && (
          <div
            id={`gallery-edit-${item.id}`}
            role="region"
            aria-label={`Edit ${item.title}`}
            className="border-t border-white/6 px-4 py-4 space-y-3"
          >
            <label className="space-y-1 text-xs text-neutral-200">
              <span>Title</span>
              <input
                value={item.title}
                onChange={(e) => onUpdateLocalItem(item.id, { title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="space-y-1 text-xs text-neutral-200">
              <span>Description</span>
              <textarea
                rows={2}
                value={item.description || ''}
                onChange={(e) => onUpdateLocalItem(item.id, { description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="space-y-1 text-xs text-neutral-200">
              <span>Alt text</span>
              <input
                value={item.altText || ''}
                onChange={(e) => onUpdateLocalItem(item.id, { altText: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="space-y-1 text-xs text-neutral-200">
              <span>Categories</span>
              <input
                value={drafts[item.id]?.categories ?? ''}
                onChange={(e) => onUpdateDraft(item.id, { categories: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-200">
              <input
                type="checkbox"
                checked={item.isVisible !== false}
                onChange={(e) => onUpdateLocalItem(item.id, { isVisible: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-neutral-950 text-red-600 focus:ring-red-500"
              />
              Visible in public gallery
            </label>

            <label className="space-y-1 text-xs text-neutral-200">
              <span>Tags</span>
              <input
                value={drafts[item.id]?.tags ?? ''}
                onChange={(e) => onUpdateDraft(item.id, { tags: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-neutral-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onMetadataSave(item)}
                disabled={busyKey === `save-${item.id}`}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyKey === `save-${item.id}` ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={busyKey === `delete-${item.id}`}
                className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyKey === `delete-${item.id}` ? 'Deleting…' : 'Delete'}
              </button>
            </div>

            {/* Replace asset form */}
            <form className="space-y-2 border-t border-white/6 pt-3" onSubmit={(e) => onReplaceAssets(e, item)}>
              <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">Replace asset</span>
              {item.assetType === 'single' ? (
                <input
                  name="image"
                  required
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="block w-full rounded-lg border border-dashed border-white/15 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:text-white"
                />
              ) : (
                <div className="space-y-2">
                  <input
                    name="beforeImage"
                    required
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="block w-full rounded-lg border border-dashed border-white/15 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:text-white"
                  />
                  <input
                    name="afterImage"
                    required
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="block w-full rounded-lg border border-dashed border-white/15 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-xs file:text-white"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={busyKey === `replace-${item.id}`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyKey === `replace-${item.id}` ? 'Uploading…' : 'Replace'}
              </button>
              {busyKey === `replace-${item.id}` && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-red-500 hover:text-white"
                >
                  Cancel upload
                </button>
              )}
              {busyKey === `replace-${item.id}` && uploadProgress !== null && (
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-label={`Uploading replacement for ${item.title}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgress}
                >
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function GalleryAdminClient({ initialItems }: GalleryAdminClientProps) {
  const initialSortedItems = sortItems(initialItems);
  const [items, setItems] = useState<GalleryAdminItem[]>(initialSortedItems);
  const [drafts, setDrafts] = useState<Record<string, MetadataDraft>>(() =>
    buildDraftMap(initialSortedItems),
  );
  const [createAssetType, setCreateAssetType] = useState<GalleryAssetType>('single');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const serverItemsRef = useRef<GalleryAdminItem[]>(initialSortedItems);
  const activeMutationRef = useRef<{ key: string; controller: AbortController } | null>(null);

  const orderedItems = useMemo(() => sortItems(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function updateLocalItem(id: string, changes: Partial<GalleryAdminItem>) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  }

  async function refreshItems(signal: AbortSignal) {
    const response = await fetchAdminRequest('/api/admin/gallery', {
      cache: 'no-store',
    }, signal);

    if (!response.ok) {
      throw new Error('Unable to refresh gallery items');
    }

    const data = (await response.json()) as { items: GalleryAdminItem[] };
    const sortedItems = sortItems(data.items);
    serverItemsRef.current = sortedItems;
    setItems(sortedItems);
    setDrafts(buildDraftMap(sortedItems));
  }

  function restoreServerItems() {
    const restoredItems = serverItemsRef.current.map((item) => ({ ...item }));
    setItems(restoredItems);
    setDrafts(buildDraftMap(restoredItems));
  }

  async function runMutation(
    key: string,
    fallbackMessage: string,
    action: (signal: AbortSignal) => Promise<void>,
    onError?: () => void,
  ) {
    if (activeMutationRef.current) return;

    const controller = new AbortController();
    activeMutationRef.current = { key, controller };
    setFeedback(null);
    setBusyKey(key);

    try {
      await action(controller.signal);
    } catch (error) {
      onError?.();
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : fallbackMessage,
      });
    } finally {
      if (activeMutationRef.current?.controller === controller) {
        activeMutationRef.current = null;
        setBusyKey(null);
        setUploadProgress(null);
      }
    }
  }

  const cancelActiveMutation = useCallback(() => {
    activeMutationRef.current?.controller.abort();
  }, []);

  function updateDraft(id: string, changes: Partial<MetadataDraft>) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [id]: {
        ...(currentDrafts[id] ?? { categories: '', tags: '' }),
        ...changes,
      },
    }));
  }

  function syncDraftFromItem(item: GalleryAdminItem) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [item.id]: buildDraft(item),
    }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await runMutation('create', 'Unable to create gallery item.', async (signal) => {
      setUploadProgress(0);
      const signaturePayload = await fetchUploadSignature(signal);
      const body: Record<string, unknown> = {
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        altText: String(formData.get('altText') || ''),
        categories: parseCommaSeparatedValues(String(formData.get('categories') || '')),
        tags: parseCommaSeparatedValues(String(formData.get('tags') || '')),
        assetType: createAssetType,
        isVisible: formData.get('isVisible') === 'on',
      };

      if (createAssetType === 'single') {
        body.imageAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('image') as File | null, 'Image'),
          signaturePayload,
          setUploadProgress,
          { signal },
        );
      } else {
        body.beforeAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('beforeImage') as File | null, 'Before image'),
          signaturePayload,
          (progress) => setUploadProgress(Math.round(progress / 2)),
          { signal },
        );
        body.afterAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('afterImage') as File | null, 'After image'),
          signaturePayload,
          (progress) => setUploadProgress(50 + Math.round(progress / 2)),
          { signal },
        );
      }

      const response = await fetchAdminRequest('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to create gallery item.');
      }

      form.reset();
      setCreateAssetType('single');
      await refreshItems(signal);
      setFeedback({
        tone: 'success',
        message: 'Gallery item created successfully.',
      });
    });
  }

  async function handleMetadataSave(item: GalleryAdminItem) {
    await runMutation(`save-${item.id}`, 'Unable to save gallery item.', async (signal) => {
      const response = await fetchAdminRequest(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description || '',
          altText: item.altText || '',
          categories: parseCommaSeparatedValues(drafts[item.id]?.categories ?? ''),
          tags: parseCommaSeparatedValues(drafts[item.id]?.tags ?? ''),
          isVisible: item.isVisible !== false,
          displayOrder: item.displayOrder,
        }),
      }, signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to save gallery item.');
      }

      const data = (await response.json()) as { item?: GalleryAdminItem };
      if (!data.item?.id) throw new Error('The gallery response was incomplete.');
      updateLocalItem(item.id, data.item);
      serverItemsRef.current = serverItemsRef.current.map((entry) =>
        entry.id === data.item!.id ? data.item! : entry,
      );
      syncDraftFromItem(data.item);
      setFeedback({
        tone: 'success',
        message: `Saved changes for ${data.item.title}.`,
      });
    }, restoreServerItems);
  }

  async function handleReplaceAssets(
    event: FormEvent<HTMLFormElement>,
    item: GalleryAdminItem,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await runMutation(`replace-${item.id}`, 'Unable to replace gallery asset.', async (signal) => {
      setUploadProgress(0);
      const signaturePayload = await fetchUploadSignature(signal);
      const body: Record<string, unknown> = {};

      if (item.assetType === 'single') {
        body.imageAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('image') as File | null, 'Image'),
          signaturePayload,
          setUploadProgress,
          { signal },
        );
      } else {
        body.beforeAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('beforeImage') as File | null, 'Before image'),
          signaturePayload,
          (progress) => setUploadProgress(Math.round(progress / 2)),
          { signal },
        );
        body.afterAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('afterImage') as File | null, 'After image'),
          signaturePayload,
          (progress) => setUploadProgress(50 + Math.round(progress / 2)),
          { signal },
        );
      }

      const response = await fetchAdminRequest(`/api/admin/gallery/${item.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to replace gallery asset.');
      }

      const data = (await response.json()) as { item?: GalleryAdminItem };
      if (!data.item?.id) throw new Error('The gallery response was incomplete.');
      updateLocalItem(item.id, data.item);
      serverItemsRef.current = serverItemsRef.current.map((entry) =>
        entry.id === data.item!.id ? data.item! : entry,
      );
      syncDraftFromItem(data.item);
      form.reset();
      setFeedback({
        tone: 'success',
        message: `Replaced asset for ${data.item.title}.`,
      });
    }, restoreServerItems);
  }

  async function handleDelete(item: GalleryAdminItem) {
    if (!window.confirm(`Delete “${item.title}”? This removes the gallery record and its Cloudinary assets.`)) {
      return;
    }

    await runMutation(`delete-${item.id}`, 'Unable to delete gallery item.', async (signal) => {
      const response = await fetchAdminRequest(`/api/admin/gallery/${item.id}`, {
        method: 'DELETE',
      }, signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to delete gallery item.');
      }

      const nextItems = serverItemsRef.current.filter((entry) => entry.id !== item.id);
      serverItemsRef.current = nextItems;
      setItems(nextItems);
      setDrafts(buildDraftMap(nextItems));
      setExpandedId((current) => (current === item.id ? null : current));
      setFeedback({
        tone: 'success',
        message: `Deleted ${item.title}.`,
      });
    }, restoreServerItems);
  }

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    if (activeMutationRef.current) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedItems, oldIndex, newIndex);

    const optimisticItems = reordered.map((item, i) => ({ ...item, displayOrder: i }));
    setItems(optimisticItems);

    await runMutation('reorder', 'Unable to reorder gallery items.', async (signal) => {
      const response = await fetchAdminRequest('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
      }, signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to reorder gallery items.');
      }

      const data = (await response.json()) as { items?: GalleryAdminItem[] };
      if (!data.items) throw new Error('The gallery response was incomplete.');
      const sortedItems = sortItems(data.items);
      serverItemsRef.current = sortedItems;
      setItems(sortedItems);
      setDrafts(buildDraftMap(sortedItems));
      setFeedback({ tone: 'success', message: 'Gallery order updated.' });
    }, restoreServerItems);
  }

  return (
    <div className="space-y-8">
      <GlassCard className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-white tracking-wide">Add gallery item</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Upload a single showcase image or a before/after comparison. Drag items below to reorder.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-200">
              <span>Title</span>
              <input
                required
                name="title"
                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="space-y-2 text-sm text-neutral-200">
              <span>Categories</span>
              <input
                defaultValue="showcase"
                name="categories"
                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-neutral-200">
            <span>Description</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </label>

          <label className="space-y-2 text-sm text-neutral-200">
            <span>Alt text</span>
            <input
              name="altText"
              className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-200">
              <span>Tags</span>
              <input
                name="tags"
                placeholder="exterior, ceramic, before-after"
                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
              />
            </label>

            <label className="space-y-2 text-sm text-neutral-200">
              <span>Asset type</span>
              <select
                value={createAssetType}
                onChange={(event) => setCreateAssetType(event.target.value as GalleryAssetType)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950/80 px-4 py-3 text-white outline-none transition focus:border-red-500"
              >
                <option value="single">Single image</option>
                <option value="comparison">Before / after comparison</option>
              </select>
            </label>
          </div>

          {createAssetType === 'single' ? (
            <label className="space-y-2 text-sm text-neutral-200">
              <span>Image</span>
              <input
                required
                name="image"
                type="file"
                accept={IMAGE_ACCEPT}
                className="block w-full rounded-xl border border-dashed border-white/15 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white"
              />
            </label>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-neutral-200">
                <span>Before image</span>
                <input
                  required
                  name="beforeImage"
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="block w-full rounded-xl border border-dashed border-white/15 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white"
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-200">
                <span>After image</span>
                <input
                  required
                  name="afterImage"
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="block w-full rounded-xl border border-dashed border-white/15 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white"
                />
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                name="isVisible"
                defaultChecked
                className="h-4 w-4 rounded border-white/20 bg-neutral-950 text-red-600 focus:ring-red-500"
              />
              Visible
            </label>

            <button
              type="submit"
              disabled={busyKey === 'create'}
              className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyKey === 'create' ? 'Uploading…' : 'Create gallery item'}
            </button>
            {busyKey === 'create' && (
              <button
                type="button"
                onClick={cancelActiveMutation}
                className="inline-flex items-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-neutral-300 transition hover:border-red-500 hover:text-white"
              >
                Cancel upload
              </button>
            )}
          </div>

          {busyKey === 'create' && uploadProgress !== null && (
            <div className="space-y-1">
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Uploading new gallery item"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
              >
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500" role="status" aria-live="polite">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </form>
      </GlassCard>

      {feedback && (
        <div
          role={feedback.tone === 'error' ? 'alert' : 'status'}
          aria-live={feedback.tone === 'error' ? 'assertive' : 'polite'}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {busyKey === 'reorder' && (
        <p className="text-xs text-neutral-500 text-center motion-safe:animate-pulse" role="status" aria-live="polite">
          Saving new order…
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedItems.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orderedItems.map((item) => (
              <SortableGalleryCard
                key={item.id}
                item={item}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                busyKey={busyKey}
                drafts={drafts}
                onUpdateLocalItem={updateLocalItem}
                onUpdateDraft={updateDraft}
                onMetadataSave={handleMetadataSave}
                onDelete={handleDelete}
                onReplaceAssets={handleReplaceAssets}
                onCancel={cancelActiveMutation}
                uploadProgress={uploadProgress}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-center text-neutral-500 text-sm tracking-wide">
        {orderedItems.length} {orderedItems.length === 1 ? 'item' : 'items'}
      </div>
    </div>
  );
}
