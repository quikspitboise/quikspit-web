'use client';

import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { assertImageFile, IMAGE_ACCEPT } from '@/lib/cloudinary-upload';
import { cx } from '../ui';

function ImageIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={cx('fill-none stroke-current', className)} viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-9 9" />
    </svg>
  );
}

/**
 * Tap to choose a photo (or drop one on desktop) with an instant preview.
 * `current` shows what is there now, so replacing reads as before → after.
 */
export function ImagePicker({
  label,
  file,
  onChange,
  current,
  disabled,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** The image already saved, shown until a new one is picked. */
  current?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFailed(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (candidate: File | null | undefined) => {
    if (!candidate) return;
    try {
      onChange(assertImageFile(candidate, label));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That file cannot be used.');
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) pick(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-neutral-200">{label}</label>
        {file && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="rounded px-1 text-xs text-neutral-400 underline underline-offset-2 hover:text-white"
          >
            {current ? 'Keep current photo' : 'Remove'}
          </button>
        )}
      </div>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cx(
          'relative flex aspect-4/3 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-red-500',
          dragging ? 'border-red-500 bg-red-500/10' : 'border-white/15 bg-neutral-950 hover:border-white/30',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {previewUrl && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setPreviewFailed(true)} />
        ) : file ? (
          <span className="px-4 text-sm text-neutral-300">
            <ImageIcon className="mx-auto mb-2 h-7 w-7 text-neutral-500" />
            {file.name}
            <span className="mt-1 block text-xs text-neutral-500">Preview not available for this format</span>
          </span>
        ) : current ? (
          <span className="absolute inset-0">{current}</span>
        ) : (
          <span className="px-4 text-sm text-neutral-400">
            <ImageIcon className="mx-auto mb-2 h-8 w-8 text-neutral-500" />
            <span className="font-medium text-white">Choose a photo</span>
            <span className="mt-1 block text-xs text-neutral-500">JPEG, PNG, WebP, or HEIC up to 10 MB</span>
          </span>
        )}
        {(file || current) && (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white">
            {file ? 'New photo' : 'Tap to replace'}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </label>
      {error && <p className="text-xs text-red-300" role="alert">{error}</p>}
    </div>
  );
}
