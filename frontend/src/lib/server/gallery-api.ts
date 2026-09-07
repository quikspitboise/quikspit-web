import 'server-only';

import { NextResponse } from 'next/server';
import { GALLERY_ITEMS } from '@/data/gallery';
import { buildBackendApiUrl } from '../backend-api';
import { createTimeoutSignal } from '../fetch-with-timeout';
import type { GalleryAdminItem, GalleryItem } from '../gallery';
import { getAdminApiAuth } from './admin-auth';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export type PublicGalleryItemsResult = {
  items: GalleryItem[];
  source: 'api' | 'fallback';
};

function getMethod(method: string | undefined): string {
  return (method || 'GET').toUpperCase();
}

function isSameOriginUrl(candidate: string, expectedOrigin: string): boolean {
  try {
    return new URL(candidate).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function validateAdminMutationOrigin(request: Request): NextResponse | null {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get('origin');

  if (originHeader) {
    if (originHeader !== requestOrigin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return null;
  }

  const refererHeader = request.headers.get('referer');
  if (refererHeader && isSameOriginUrl(refererHeader, requestOrigin)) {
    return null;
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function fetchPublicGalleryItems(): Promise<PublicGalleryItemsResult> {
  try {
    const response = await fetch(buildBackendApiUrl('/gallery'), {
      next: { revalidate: 60 },
      signal: createTimeoutSignal(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery items: ${response.status}`);
    }

    const data = (await response.json()) as { items?: GalleryItem[] };
    if (!data || !Array.isArray(data.items)) {
      throw new Error('Invalid gallery payload: expected { items: GalleryItem[] }');
    }

    return {
      items: data.items,
      source: 'api',
    };
  } catch (error) {
    console.error('Falling back to static gallery items', error);
    return {
      items: GALLERY_ITEMS,
      source: 'fallback',
    };
  }
}

export async function fetchAdminGalleryItems(): Promise<GalleryAdminItem[]> {
  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    throw new Error('Admin session is required');
  }

  const response = await fetch(buildBackendApiUrl('/gallery/admin/items'), {
    cache: 'no-store',
    signal: createTimeoutSignal(),
    headers: {
      Authorization: `Bearer ${adminAuth.token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch admin gallery items (${response.status}): ${body.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as { items: GalleryAdminItem[] };
  return data.items;
}

export async function proxyAdminRequest(
  request: Request,
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const method = getMethod(init.method ?? request.method);

  if (!SAFE_METHODS.has(method)) {
    const originValidationResponse = validateAdminMutationOrigin(request);
    if (originValidationResponse) {
      return originValidationResponse;
    }
  }

  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${adminAuth.token}`);
  headers.set('Accept', 'application/json');

  try {
    const response = await fetch(buildBackendApiUrl(path), {
      ...init,
      method,
      headers,
      cache: 'no-store',
      signal: init.signal ?? createTimeoutSignal(),
    });

    if (response.status >= 500) {
      console.error('Admin backend request failed', {
        path,
        status: response.status,
      });
      await response.body?.cancel();

      return NextResponse.json(
        { message: 'The server could not complete this request. Please try again.' },
        { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const hasNoBody = method === 'HEAD' || [204, 205, 304].includes(response.status);
    const body = hasNoBody ? null : await response.text();
    const responseHeaders = new Headers({ 'Cache-Control': 'private, no-store' });
    for (const name of ['content-type', 'retry-after']) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');
    console.error('Admin backend request unavailable', { path, timedOut });

    return NextResponse.json(
      {
        message: timedOut
          ? 'The server took too long to respond. Please try again.'
          : 'The server is temporarily unavailable. Please try again.',
      },
      {
        status: timedOut ? 504 : 502,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
}
