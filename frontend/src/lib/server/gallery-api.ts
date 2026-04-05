import 'server-only';

import { NextResponse } from 'next/server';
import { GALLERY_ITEMS } from '@/data/gallery';
import { buildBackendApiUrl } from '../backend-api';
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
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery items: ${response.status}`);
    }

    const data = (await response.json()) as { items: GalleryItem[] };
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

  const response = await fetch(buildBackendApiUrl(path), {
    ...init,
    method,
    headers,
    cache: 'no-store',
  });

  const body = await response.text();
  const contentType = response.headers.get('content-type') ?? 'application/json';

  return new NextResponse(body, {
    status: response.status,
    headers: {
      'content-type': contentType,
    },
  });
}
