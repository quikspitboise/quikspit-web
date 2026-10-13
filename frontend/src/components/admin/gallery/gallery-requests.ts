import type { GalleryAdminItem } from '@/lib/gallery';
import { uploadFileToCloudinary, type CloudinaryAssetPayload, type UploadSignatureResponse } from '@/lib/cloudinary-upload';
import { describeApiError } from '@/lib/content/validation';

const MUTATION_TIMEOUT_MS = 20_000;

export function sortItems(items: GalleryAdminItem[]): GalleryAdminItem[] {
  return [...items].sort((left, right) => left.displayOrder - right.displayOrder);
}

/** JSON request to the admin gallery proxy, cancellable and time-limited. */
export async function galleryRequest<T>(path: string, init: RequestInit, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, MUTATION_TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(`/api/admin/gallery${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(describeApiError(body, 'The gallery could not be updated.'));
    return body as T;
  } catch (error) {
    if (timedOut) throw new Error('The request timed out.');
    if (signal?.aborted) throw new Error('Cancelled.');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abort);
  }
}

/**
 * Upload one or two photos to Cloudinary with a single signature, reporting
 * combined progress from 0 to 100.
 */
export async function uploadPhotos(
  files: File[],
  onProgress: (progress: number) => void,
  signal: AbortSignal,
): Promise<CloudinaryAssetPayload[]> {
  const signature = await galleryRequest<UploadSignatureResponse>('/upload-signature', { method: 'POST' }, signal);
  const assets: CloudinaryAssetPayload[] = [];
  for (const [index, file] of files.entries()) {
    assets.push(
      await uploadFileToCloudinary(
        file,
        signature,
        (progress) => onProgress(Math.round((index * 100 + progress) / files.length)),
        { signal },
      ),
    );
  }
  return assets;
}
