import { proxyGalleryMutation } from '@/lib/server/gallery-revalidation';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyGalleryMutation(request, `/gallery/admin/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyGalleryMutation(request, `/gallery/admin/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
