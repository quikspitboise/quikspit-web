import 'server-only';

import { GALLERY_CACHE_TAG, proxyAdminRequest } from './gallery-api';
import { refreshPublicCache } from './public-cache';

/** Proxy a gallery change, then expire the public gallery so it shows at once. */
export async function proxyGalleryMutation(request: Request, path: string, init: RequestInit) {
  const response = await proxyAdminRequest(request, path, init);
  if (response.ok) refreshPublicCache({ tags: [GALLERY_CACHE_TAG] });
  return response;
}
