import { proxyAdminRequest } from '@/lib/server/gallery-api';
import { proxyGalleryMutation } from '@/lib/server/gallery-revalidation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyAdminRequest(request, '/gallery/admin/items', {
    method: 'GET',
  });
}

export async function POST(request: Request) {
  return proxyGalleryMutation(request, '/gallery/admin/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}
