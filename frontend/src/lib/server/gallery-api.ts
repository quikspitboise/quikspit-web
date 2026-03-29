import 'server-only';

import { NextResponse } from 'next/server';
import { buildBackendApiUrl } from '../backend-api';
import type { GalleryAdminItem, GalleryItem } from '../gallery';
import { getAdminApiAuth } from './admin-auth';

export async function fetchPublicGalleryItems(): Promise<GalleryItem[]> {
  const response = await fetch(buildBackendApiUrl('/gallery'), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch gallery items');
  }

  const data = (await response.json()) as { items: GalleryItem[] };
  return data.items;
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
    throw new Error('Failed to fetch admin gallery items');
  }

  const data = (await response.json()) as { items: GalleryAdminItem[] };
  return data.items;
}

export async function proxyAdminRequest(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${adminAuth.token}`);
  headers.set('Accept', 'application/json');

  const response = await fetch(buildBackendApiUrl(path), {
    ...init,
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
