import { proxyGalleryMutation } from '@/lib/server/gallery-revalidation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return proxyGalleryMutation(request, '/gallery/admin/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}
