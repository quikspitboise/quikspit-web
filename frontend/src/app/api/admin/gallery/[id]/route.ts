import { proxyAdminRequest } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, `/gallery/admin/items/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, `/gallery/admin/items/${id}`, {
    method: 'DELETE',
  });
}
