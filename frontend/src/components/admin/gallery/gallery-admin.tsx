'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { GalleryAdminItem, GalleryAssetType } from '@/lib/gallery';
import {
  ArrowIcon,
  Badge,
  Button,
  Card,
  EyeIcon,
  GripIcon,
  IconButton,
  Notice,
  PlusIcon,
  SegmentedControl,
  Sheet,
  Spinner,
  Switch,
  TextArea,
  TextInput,
  TrashIcon,
  cx,
  inputClass,
  useConfirm,
  useToast,
} from '../ui';
import { ImagePicker } from './image-picker';
import { TagInput } from './tag-input';
import { galleryRequest, sortItems, uploadPhotos } from './gallery-requests';

type Filter = 'all' | 'visible' | 'hidden';

type MetadataForm = {
  title: string;
  description: string;
  altText: string;
  categories: string[];
  tags: string[];
  isVisible: boolean;
};

const formFromItem = (item: GalleryAdminItem): MetadataForm => ({
  title: item.title,
  description: item.description ?? '',
  altText: item.altText ?? '',
  categories: item.categories,
  tags: item.tags,
  isVisible: item.isVisible !== false,
});

const EMPTY_FORM: MetadataForm = { title: '', description: '', altText: '', categories: ['showcase'], tags: [], isVisible: true };

/* ─── Thumbnails ─── */

function Photo({ src, alt, sizes }: { src?: string; alt: string; sizes: string }) {
  if (!src) {
    return <div className="flex h-full items-center justify-center bg-neutral-950 text-xs text-neutral-600">No photo</div>;
  }
  return <CldImage src={src} alt={alt} fill sizes={sizes} crop="fill" gravity="auto" format="auto" quality="auto" className="object-cover" />;
}

function Thumbnail({
  item,
  sizes = '(min-width: 1280px) 280px, (min-width: 640px) 33vw, 50vw',
  compact = false,
}: {
  item: GalleryAdminItem;
  sizes?: string;
  /** Small thumbnails skip the before/after labels, which would collide. */
  compact?: boolean;
}) {
  const alt = item.altText || item.title;
  if (item.assetType === 'comparison') {
    return (
      <div className="grid h-full grid-cols-2">
        <div className="relative overflow-hidden">
          <Photo src={item.beforeUrl} alt={`${alt}, before`} sizes={sizes} />
          {!compact && <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-200">Before</span>}
        </div>
        <div className="relative overflow-hidden border-l border-black">
          <Photo src={item.afterUrl} alt={`${alt}, after`} sizes={sizes} />
          {!compact && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-200">After</span>}
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-full">
      <Photo src={item.imageUrl} alt={alt} sizes={sizes} />
    </div>
  );
}

/* ─── Shared form ─── */

function MetadataFields({
  form,
  onChange,
  suggestions,
  disabled,
}: {
  form: MetadataForm;
  onChange: (form: MetadataForm) => void;
  suggestions: { categories: string[]; tags: string[] };
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <TextInput label="Title" required value={form.title} onChange={(title) => onChange({ ...form, title })} maxLength={160} />
      <TextArea label="Description (optional)" rows={2} value={form.description} onChange={(description) => onChange({ ...form, description })} />
      <TextInput
        label="Photo description"
        hint="Describes the photo for screen readers and search engines, like “Black F-150 after a full exterior detail”."
        value={form.altText}
        maxLength={255}
        onChange={(altText) => onChange({ ...form, altText })}
      />
      <TagInput
        label="Categories"
        hint="Visitors filter the gallery by these."
        values={form.categories}
        suggestions={suggestions.categories}
        onChange={(categories) => onChange({ ...form, categories })}
      />
      <TagInput label="Tags (optional)" values={form.tags} suggestions={suggestions.tags} onChange={(tags) => onChange({ ...form, tags })} placeholder="exterior, ceramic" />
      <Switch
        label="Show in the public gallery"
        description={form.isVisible ? 'Visitors can see this.' : 'Only admins can see this.'}
        checked={form.isVisible}
        onChange={(isVisible) => onChange({ ...form, isVisible })}
      />
    </fieldset>
  );
}

function UploadProgress({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="w-full space-y-1" role="status" aria-live="polite">
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="h-full bg-red-500 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-neutral-500">Uploading… {progress}%</p>
    </div>
  );
}

/* ─── Arrange mode ─── */

function SortableRow({
  item,
  index,
  count,
  onMove,
}: {
  item: GalleryAdminItem;
  index: number;
  count: number;
  onMove: (to: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        'flex items-center gap-2 rounded-xl border bg-neutral-950 p-2',
        isDragging ? 'relative z-10 border-red-500/60 shadow-2xl shadow-black' : 'border-white/[0.08]',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-neutral-500 hover:text-white active:cursor-grabbing"
        aria-label={`Drag to move ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-900">
        <Thumbnail item={item} sizes="64px" compact />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{item.title}</span>
        <span className="text-xs text-neutral-500 tabular">
          {index + 1} of {count}
          {item.isVisible === false && ' · hidden'}
        </span>
      </span>
      <IconButton label={`Move ${item.title} earlier`} disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ArrowIcon direction="up" />
      </IconButton>
      <IconButton label={`Move ${item.title} later`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <ArrowIcon direction="down" />
      </IconButton>
    </li>
  );
}

function ArrangeList({
  items,
  saving,
  onCancel,
  onSave,
}: {
  items: GalleryAdminItem[];
  saving: boolean;
  onCancel: () => void;
  onSave: (ordered: GalleryAdminItem[]) => void;
}) {
  const [order, setOrder] = useState(items);
  const changed = order.some((item, index) => item.id !== items[index]?.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // A short press before dragging keeps the page scrollable on touch.
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((current) =>
      arrayMove(current, current.findIndex((item) => item.id === active.id), current.findIndex((item) => item.id === over.id)),
    );
  };

  return (
    <div>
      <Notice tone="info" className="mb-4">
        Drag the handle, or use the arrows, to set the order visitors see. The first photos lead the gallery.
      </Notice>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {order.map((item, index) => (
              <SortableRow
                key={item.id}
                item={item}
                index={index}
                count={order.length}
                onMove={(to) => setOrder((current) => arrayMove(current, index, to))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="sticky bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 mt-4 flex items-center justify-end gap-2 rounded-2xl border border-white/10 bg-neutral-950/95 p-2.5 shadow-2xl shadow-black backdrop-blur">
        <span className="mr-auto pl-1 text-sm text-neutral-400">{changed ? 'Order changed' : 'No changes yet'}</span>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(order)} disabled={!changed || saving}>
          {saving && <Spinner />}
          {saving ? 'Saving' : 'Save order'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Main ─── */

export function GalleryAdmin({ initialItems }: { initialItems: GalleryAdminItem[] }) {
  const confirm = useConfirm();
  const notify = useToast();
  const [items, setItems] = useState(() => sortItems(initialItems));
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [arranging, setArranging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MetadataForm>(EMPTY_FORM);
  const [replacements, setReplacements] = useState<{ image: File | null; before: File | null; after: File | null }>({ image: null, before: null, after: null });
  // Adding
  const [adding, setAdding] = useState(false);
  const [addType, setAddType] = useState<GalleryAssetType>('comparison');
  const [addForm, setAddForm] = useState<MetadataForm>(EMPTY_FORM);
  const [addFiles, setAddFiles] = useState<{ image: File | null; before: File | null; after: File | null }>({ image: null, before: null, after: null });

  const editing = items.find((item) => item.id === editingId) ?? null;
  const suggestions = useMemo(() => {
    const count = (values: string[]) => {
      const counts = new Map<string, number>();
      for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
    };
    return { categories: count(items.flatMap((item) => item.categories)), tags: count(items.flatMap((item) => item.tags)) };
  }, [items]);

  const visibleCount = items.filter((item) => item.isVisible !== false).length;
  const shown = items.filter((item) => {
    if (filter === 'visible' && item.isVisible === false) return false;
    if (filter === 'hidden' && item.isVisible !== false) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [item.title, item.description ?? '', ...item.categories, ...item.tags].some((value) => value.toLowerCase().includes(needle));
  });

  const replaceItem = (next: GalleryAdminItem) => setItems((current) => current.map((item) => (item.id === next.id ? next : item)));

  /** One change at a time; uploads can be cancelled. */
  const run = useCallback(async (key: string, action: (signal: AbortSignal) => Promise<void>) => {
    if (controllerRef.current) return false;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(key);
    setError(null);
    try {
      await action(controller.signal);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      return false;
    } finally {
      controllerRef.current = null;
      setBusy(null);
      setProgress(null);
    }
  }, []);

  const cancelUpload = () => controllerRef.current?.abort();

  const editDirty =
    editing !== null &&
    (JSON.stringify(editForm) !== JSON.stringify(formFromItem(editing)) || Boolean(replacements.image || replacements.before || replacements.after));

  const openEditor = (item: GalleryAdminItem) => {
    setEditingId(item.id);
    setEditForm(formFromItem(item));
    setReplacements({ image: null, before: null, after: null });
    setError(null);
  };

  const closeEditor = async () => {
    if (busy) return;
    if (editDirty && !(await confirm({ title: 'Discard changes?', body: 'Your edits to this photo have not been saved.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editForm.title.trim()) {
      setError('Add a title.');
      return;
    }
    const ok = await run(`save-${editing.id}`, async (signal) => {
      let latest = editing;
      if (JSON.stringify(editForm) !== JSON.stringify(formFromItem(editing))) {
        const { item } = await galleryRequest<{ item: GalleryAdminItem }>(`/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...editForm, title: editForm.title.trim(), displayOrder: editing.displayOrder }),
        }, signal);
        latest = item;
        replaceItem(item);
      }
      const files = editing.assetType === 'single'
        ? [replacements.image].filter((file): file is File => Boolean(file))
        : [replacements.before, replacements.after];
      if (files.some(Boolean)) {
        if (editing.assetType === 'comparison' && !files.every(Boolean)) {
          throw new Error('Choose both a before and an after photo to replace a comparison.');
        }
        setProgress(0);
        const assets = await uploadPhotos(files as File[], setProgress, signal);
        const { item } = await galleryRequest<{ item: GalleryAdminItem }>(`/${editing.id}/assets`, {
          method: 'POST',
          body: JSON.stringify(editing.assetType === 'single' ? { imageAsset: assets[0] } : { beforeAsset: assets[0], afterAsset: assets[1] }),
        }, signal);
        latest = item;
        replaceItem(item);
      }
      notify({ tone: 'success', message: `Saved “${latest.title}”.` });
    });
    if (ok) setEditingId(null);
  };

  const toggleVisibility = (item: GalleryAdminItem) =>
    run(`visibility-${item.id}`, async (signal) => {
      const isVisible = item.isVisible === false;
      const { item: updated } = await galleryRequest<{ item: GalleryAdminItem }>(`/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible }),
      }, signal);
      replaceItem(updated);
      notify({ tone: 'success', message: isVisible ? `“${item.title}” is now in the public gallery.` : `“${item.title}” is hidden from visitors.` });
    });

  const deleteItem = async (item: GalleryAdminItem) => {
    const ok = await confirm({
      title: `Delete “${item.title}”?`,
      body: 'This removes it from the gallery and deletes its photos from Cloudinary. To keep it but take it off the site, hide it instead.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    const done = await run(`delete-${item.id}`, async (signal) => {
      await galleryRequest(`/${item.id}`, { method: 'DELETE' }, signal);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      notify({ tone: 'success', message: `Deleted “${item.title}”.` });
    });
    if (done) setEditingId(null);
  };

  const addReady =
    addForm.title.trim() !== '' && (addType === 'single' ? Boolean(addFiles.image) : Boolean(addFiles.before && addFiles.after));
  const addDirty = JSON.stringify(addForm) !== JSON.stringify(EMPTY_FORM) || Boolean(addFiles.image || addFiles.before || addFiles.after);

  const openAdd = () => {
    setAdding(true);
    setError(null);
  };

  const closeAdd = async () => {
    if (busy === 'create') return;
    if (addDirty && !(await confirm({ title: 'Discard this photo?', body: 'It has not been uploaded yet.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    setAdding(false);
    setAddForm(EMPTY_FORM);
    setAddFiles({ image: null, before: null, after: null });
  };

  const create = async () => {
    if (!addReady) {
      setError(addForm.title.trim() ? 'Choose the photos to upload.' : 'Add a title.');
      return;
    }
    const ok = await run('create', async (signal) => {
      setProgress(0);
      const files = addType === 'single' ? [addFiles.image!] : [addFiles.before!, addFiles.after!];
      const assets = await uploadPhotos(files, setProgress, signal);
      await galleryRequest('', {
        method: 'POST',
        body: JSON.stringify({
          ...addForm,
          title: addForm.title.trim(),
          assetType: addType,
          ...(addType === 'single' ? { imageAsset: assets[0] } : { beforeAsset: assets[0], afterAsset: assets[1] }),
        }),
      }, signal);
      const { items: refreshed } = await galleryRequest<{ items: GalleryAdminItem[] }>('', { method: 'GET' }, signal);
      setItems(sortItems(refreshed));
      notify({ tone: 'success', message: `Added “${addForm.title.trim()}”${addForm.isVisible ? '' : ' (hidden)'}.` });
    });
    if (ok) {
      setAdding(false);
      setAddForm(EMPTY_FORM);
      setAddFiles({ image: null, before: null, after: null });
    }
  };

  const saveOrder = (ordered: GalleryAdminItem[]) =>
    run('reorder', async (signal) => {
      const { items: saved } = await galleryRequest<{ items: GalleryAdminItem[] }>('/reorder', {
        method: 'POST',
        body: JSON.stringify({ ids: ordered.map((item) => item.id) }),
      }, signal);
      setItems(sortItems(saved));
      setArranging(false);
      notify({ tone: 'success', message: 'Gallery order saved.' });
    });

  return (
    <Card
      title="Gallery"
      description={`${items.length} ${items.length === 1 ? 'photo' : 'photos'}, ${visibleCount} shown to visitors.`}
      actions={
        !arranging && (
          <>
            <Button onClick={() => setArranging(true)} disabled={items.length < 2}>Arrange</Button>
            <Button variant="primary" onClick={openAdd}>
              <PlusIcon /> Add photos
            </Button>
          </>
        )
      }
    >
      {error && !editing && !adding && <Notice tone="danger" className="mb-4">{error}</Notice>}

      {arranging ? (
        <ArrangeList items={items} saving={busy === 'reorder'} onCancel={() => setArranging(false)} onSave={saveOrder} />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <SegmentedControl
              label="Show"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: `All ${items.length}` },
                { value: 'visible', label: `Shown ${visibleCount}` },
                { value: 'hidden', label: `Hidden ${items.length - visibleCount}` },
              ]}
            />
            <label className="sr-only" htmlFor="gallery-search">Search photos</label>
            <input
              id="gallery-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, categories, tags"
              className={cx(inputClass, 'sm:ml-auto sm:max-w-xs')}
            />
          </div>

          {shown.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-neutral-400">
              {items.length === 0 ? 'No photos yet. Add your first before and after.' : 'No photos match.'}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {shown.map((item) => {
                const hidden = item.isVisible === false;
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      aria-label={`Edit ${item.title}${hidden ? ' (hidden)' : ''}`}
                      onClick={() => openEditor(item)}
                      className={cx(
                        'group block w-full overflow-hidden rounded-xl border bg-neutral-950 text-left transition-colors hover:border-white/25',
                        hidden ? 'border-dashed border-white/15' : 'border-white/[0.08]',
                      )}
                    >
                      <span className={cx('relative block aspect-4/3', hidden && 'opacity-50')}>
                        <Thumbnail item={item} />
                      </span>
                      <span className="block p-2.5 pr-12">
                        <span className="block truncate text-sm font-medium text-white">{item.title}</span>
                        <span className="block truncate text-xs text-neutral-500">
                          {item.assetType === 'comparison' ? 'Before & after' : 'Photo'}
                          {item.categories.length > 0 && ` · ${item.categories.join(', ')}`}
                        </span>
                      </span>
                      {hidden && <Badge tone="warning" className="absolute left-2 top-2 bg-black/80">Hidden</Badge>}
                    </button>
                    <IconButton
                      label={hidden ? `Show ${item.title} in the gallery` : `Hide ${item.title} from the gallery`}
                      aria-pressed={hidden}
                      onClick={() => toggleVisibility(item)}
                      disabled={busy !== null}
                      className={cx('absolute bottom-1 right-1', hidden ? 'text-amber-300' : '')}
                    >
                      {busy === `visibility-${item.id}` ? <Spinner /> : <EyeIcon off={hidden} />}
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <Sheet
        open={editing !== null}
        onClose={closeEditor}
        size="lg"
        title={editing?.title || 'Edit photo'}
        description={editing?.assetType === 'comparison' ? 'Before and after comparison' : 'Single photo'}
        footer={
          editing && (
            <>
              {busy?.startsWith('save-') && progress !== null ? (
                <>
                  <UploadProgress progress={progress} label={`Uploading replacement for ${editing.title}`} />
                  <Button variant="ghost" onClick={cancelUpload}>Cancel upload</Button>
                </>
              ) : (
                <>
                  <Button variant="danger" onClick={() => deleteItem(editing)} disabled={busy !== null} className="mr-auto">
                    {busy === `delete-${editing.id}` ? <Spinner /> : <TrashIcon />} Delete
                  </Button>
                  <Button variant="ghost" onClick={closeEditor} disabled={busy !== null}>Cancel</Button>
                  <Button variant="primary" onClick={saveEdit} disabled={!editDirty || busy !== null}>
                    {busy === `save-${editing.id}` && <Spinner />}
                    Save
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {editing && (
          <div className="space-y-5">
            {error && <Notice tone="danger">{error}</Notice>}
            {editing.assetType === 'single' ? (
              <ImagePicker
                label="Photo"
                file={replacements.image}
                onChange={(image) => setReplacements((current) => ({ ...current, image }))}
                current={<Photo src={editing.imageUrl} alt={editing.altText || editing.title} sizes="600px" />}
                disabled={busy !== null}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <ImagePicker
                  label="Before"
                  file={replacements.before}
                  onChange={(before) => setReplacements((current) => ({ ...current, before }))}
                  current={<Photo src={editing.beforeUrl} alt={`${editing.title}, before`} sizes="300px" />}
                  disabled={busy !== null}
                />
                <ImagePicker
                  label="After"
                  file={replacements.after}
                  onChange={(after) => setReplacements((current) => ({ ...current, after }))}
                  current={<Photo src={editing.afterUrl} alt={`${editing.title}, after`} sizes="300px" />}
                  disabled={busy !== null}
                />
              </div>
            )}
            <MetadataFields form={editForm} onChange={setEditForm} suggestions={suggestions} disabled={busy !== null} />
          </div>
        )}
      </Sheet>

      <Sheet
        open={adding}
        onClose={closeAdd}
        size="lg"
        title="Add photos"
        description="Photos upload straight to Cloudinary."
        footer={
          busy === 'create' && progress !== null ? (
            <>
              <UploadProgress progress={progress} label="Uploading new gallery photos" />
              <Button variant="ghost" onClick={cancelUpload}>Cancel upload</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={closeAdd} disabled={busy !== null}>Cancel</Button>
              <Button variant="primary" onClick={create} disabled={!addReady || busy !== null}>
                {busy === 'create' && <Spinner />}
                Upload and add
              </Button>
            </>
          )
        }
      >
        <div className="space-y-5">
          {error && <Notice tone="danger">{error}</Notice>}
          <SegmentedControl
            label="Type"
            value={addType}
            onChange={setAddType}
            options={[
              { value: 'comparison', label: 'Before & after' },
              { value: 'single', label: 'Single photo' },
            ]}
          />
          {addType === 'single' ? (
            <ImagePicker label="Photo" file={addFiles.image} onChange={(image) => setAddFiles((current) => ({ ...current, image }))} disabled={busy !== null} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <ImagePicker label="Before" file={addFiles.before} onChange={(before) => setAddFiles((current) => ({ ...current, before }))} disabled={busy !== null} />
              <ImagePicker label="After" file={addFiles.after} onChange={(after) => setAddFiles((current) => ({ ...current, after }))} disabled={busy !== null} />
            </div>
          )}
          <MetadataFields form={addForm} onChange={setAddForm} suggestions={suggestions} disabled={busy !== null} />
        </div>
      </Sheet>
    </Card>
  );
}
