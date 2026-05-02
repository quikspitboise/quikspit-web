'use client';

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { CldImage } from 'next-cloudinary';
import { GlassCard } from '@/components/ui/glass-card';
import type { GalleryAdminItem, GalleryAssetType } from '@/lib/gallery';
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

type CloudinaryAssetPayload = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalFilename?: string;
};

type UploadSignatureResponse = {
  cloudName: string;
  apiKey: string;
  signature: string;
  params: Record<string, string | number | boolean>;
};

type CloudinaryUploadResponse = {
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  original_filename?: string;
  error?: { message?: string };
};

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const ACCEPTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

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

function assertImageFile(file: File | null, label: string): File {
  if (!file || file.size === 0) {
    throw new Error(`${label} is required.`);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${label} must be 10 MB or smaller.`);
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const hasAcceptedType = file.type ? ACCEPTED_IMAGE_TYPES.has(file.type) : false;
  const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.includes(extension);

  if (!hasAcceptedType && !hasAcceptedExtension) {
    throw new Error(`${label} must be a HEIC, JPEG, PNG, or WebP image.`);
  }

  return file;
}

async function fetchUploadSignature(): Promise<UploadSignatureResponse> {
  const response = await fetch('/api/admin/gallery/upload-signature', {
    method: 'POST',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error || 'Unable to sign Cloudinary upload.');
  }

  return response.json() as Promise<UploadSignatureResponse>;
}

function uploadFileToCloudinary(
  file: File,
  signaturePayload: UploadSignatureResponse,
  onProgress: (progress: number) => void,
): Promise<CloudinaryAssetPayload> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.set('file', file);
    formData.set('api_key', signaturePayload.apiKey);
    formData.set('signature', signaturePayload.signature);

    Object.entries(signaturePayload.params).forEach(([key, value]) => {
      formData.set(key, String(value));
    });

    const request = new XMLHttpRequest();
    request.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/image/upload`,
    );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      let payload: CloudinaryUploadResponse;

      try {
        payload = JSON.parse(request.responseText || '{}') as CloudinaryUploadResponse;
      } catch {
        reject(new Error('Cloudinary returned an unreadable response.'));
        return;
      }

      if (request.status < 200 || request.status >= 300) {
        reject(new Error(payload.error?.message || 'Cloudinary upload failed.'));
        return;
      }

      if (!payload.public_id || !payload.secure_url) {
        reject(new Error('Cloudinary did not return required image metadata.'));
        return;
      }

      resolve({
        publicId: payload.public_id,
        secureUrl: payload.secure_url,
        width: payload.width ?? 0,
        height: payload.height ?? 0,
        format: payload.format ?? '',
        bytes: payload.bytes ?? file.size,
        originalFilename: payload.original_filename ?? file.name,
      });
    };

    request.onerror = () => reject(new Error('Cloudinary upload failed.'));
    request.send(formData);
  });
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
          <div className="border-t border-white/6 px-4 py-4 space-y-3">
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
              {busyKey === `replace-${item.id}` && uploadProgress !== null && (
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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
  const [items, setItems] = useState<GalleryAdminItem[]>(() => sortItems(initialItems));
  const [drafts, setDrafts] = useState<Record<string, MetadataDraft>>(() =>
    buildDraftMap(sortItems(initialItems)),
  );
  const [createAssetType, setCreateAssetType] = useState<GalleryAssetType>('single');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  async function refreshItems() {
    const response = await fetch('/api/admin/gallery', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Unable to refresh gallery items');
    }

    const data = (await response.json()) as { items: GalleryAdminItem[] };
    const sortedItems = sortItems(data.items);
    setItems(sortedItems);
    setDrafts(buildDraftMap(sortedItems));
  }

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
    setFeedback(null);
    setBusyKey('create');
    setUploadProgress(0);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const signaturePayload = await fetchUploadSignature();
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
        );
      } else {
        body.beforeAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('beforeImage') as File | null, 'Before image'),
          signaturePayload,
          (progress) => setUploadProgress(Math.round(progress / 2)),
        );
        body.afterAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('afterImage') as File | null, 'After image'),
          signaturePayload,
          (progress) => setUploadProgress(50 + Math.round(progress / 2)),
        );
      }

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to create gallery item.');
      }

      form.reset();
      setCreateAssetType('single');
      await refreshItems();
      setFeedback({
        tone: 'success',
        message: 'Gallery item created successfully.',
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to create gallery item.',
      });
    } finally {
      setBusyKey(null);
      setUploadProgress(null);
    }
  }

  async function handleMetadataSave(item: GalleryAdminItem) {
    setFeedback(null);
    setBusyKey(`save-${item.id}`);

    const response = await fetch(`/api/admin/gallery/${item.id}`, {
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
    });

    setBusyKey(null);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setFeedback({
        tone: 'error',
        message: payload?.message || 'Unable to save gallery item.',
      });
      return;
    }

    const data = (await response.json()) as { item: GalleryAdminItem };
    updateLocalItem(item.id, data.item);
    syncDraftFromItem(data.item);
    setFeedback({
      tone: 'success',
      message: `Saved changes for ${data.item.title}.`,
    });
  }

  async function handleReplaceAssets(
    event: FormEvent<HTMLFormElement>,
    item: GalleryAdminItem,
  ) {
    event.preventDefault();
    setFeedback(null);
    setBusyKey(`replace-${item.id}`);
    setUploadProgress(0);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const signaturePayload = await fetchUploadSignature();
      const body: Record<string, unknown> = {};

      if (item.assetType === 'single') {
        body.imageAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('image') as File | null, 'Image'),
          signaturePayload,
          setUploadProgress,
        );
      } else {
        body.beforeAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('beforeImage') as File | null, 'Before image'),
          signaturePayload,
          (progress) => setUploadProgress(Math.round(progress / 2)),
        );
        body.afterAsset = await uploadFileToCloudinary(
          assertImageFile(formData.get('afterImage') as File | null, 'After image'),
          signaturePayload,
          (progress) => setUploadProgress(50 + Math.round(progress / 2)),
        );
      }

      const response = await fetch(`/api/admin/gallery/${item.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || 'Unable to replace gallery asset.');
      }

      const data = (await response.json()) as { item: GalleryAdminItem };
      updateLocalItem(item.id, data.item);
      syncDraftFromItem(data.item);
      form.reset();
      setFeedback({
        tone: 'success',
        message: `Replaced asset for ${data.item.title}.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to replace gallery asset.',
      });
    } finally {
      setBusyKey(null);
      setUploadProgress(null);
    }
  }

  async function handleDelete(item: GalleryAdminItem) {
    if (!window.confirm(`Delete “${item.title}”? This removes the gallery record and its Cloudinary assets.`)) {
      return;
    }

    setFeedback(null);
    setBusyKey(`delete-${item.id}`);

    const response = await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'DELETE',
    });

    setBusyKey(null);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setFeedback({
        tone: 'error',
        message: payload?.message || 'Unable to delete gallery item.',
      });
      return;
    }

    setItems((currentItems) => currentItems.filter((entry) => entry.id !== item.id));
    setDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[item.id];
      return nextDrafts;
    });
    setExpandedId((current) => (current === item.id ? null : current));
    setFeedback({
      tone: 'success',
      message: `Deleted ${item.title}.`,
    });
  }

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedItems, oldIndex, newIndex);

    // Optimistic update
    setItems(reordered.map((item, i) => ({ ...item, displayOrder: i })));

    setFeedback(null);
    setBusyKey('reorder');

    const response = await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((item) => item.id) }),
    });

    setBusyKey(null);

    if (!response.ok) {
      // Roll back on failure
      setItems(orderedItems);
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setFeedback({
        tone: 'error',
        message: payload?.message || 'Unable to reorder gallery items.',
      });
      return;
    }

    const data = (await response.json()) as { items: GalleryAdminItem[] };
    setItems(sortItems(data.items));
    setFeedback({ tone: 'success', message: 'Gallery order updated.' });
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
          </div>

          {busyKey === 'create' && uploadProgress !== null && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500">{uploadProgress}% uploaded</p>
            </div>
          )}
        </form>
      </GlassCard>

      {feedback && (
        <div
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
        <p className="text-xs text-neutral-500 text-center animate-pulse">Saving new order…</p>
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
