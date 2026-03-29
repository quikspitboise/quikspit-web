import { proxyAdminRequest } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  return proxyAdminRequest(request, `/gallery/admin/items/${id}/assets`, {
    method: 'POST',
    body: await request.formData(),
  });
}
