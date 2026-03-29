import { proxyAdminRequest } from '@/lib/server/gallery-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyAdminRequest('/gallery/admin/items', {
    method: 'GET',
  });
}

export async function POST(request: Request) {
  return proxyAdminRequest('/gallery/admin/items', {
    method: 'POST',
    body: await request.formData(),
  });
}
