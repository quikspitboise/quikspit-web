import { proxyGalleryMutation } from '@/lib/server/gallery-revalidation';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyGalleryMutation(request, `/gallery/admin/items/${encodeURIComponent(id)}/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}
