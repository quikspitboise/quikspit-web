import { NextResponse } from 'next/server';
import { proxyAdminRequest } from '@/lib/server/gallery-api';
import { refreshPublishedContent } from '@/lib/server/content-revalidation';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const DOCUMENT_ACTIONS = new Set(['publish', 'unpublish', 'reorder', 'restore']);

/** Map an allowed admin route to its backend path, or null. */
function backendPath(method: string, segments: string[], search: string): string | null {
  const [resource, key, action, id, ...rest] = segments;
  if (rest.length) return null;

  if (resource === 'pages') {
    return method === 'POST' && segments.length === 1 ? '/content/admin/pages' : null;
  }
  if (resource !== 'documents') return null;
  if (!key) return method === 'GET' ? '/content/admin/documents' : null;

  const documentPath = `/content/admin/documents/${encodeURIComponent(key)}`;
  if (!action) return method === 'GET' ? documentPath : null;
  if (action === 'draft') return method === 'PUT' && !id ? `${documentPath}/draft` : null;
  if (action === 'revisions' && method === 'GET') {
    return id ? `${documentPath}/revisions/${encodeURIComponent(id)}` : `${documentPath}/revisions${search}`;
  }
  if (DOCUMENT_ACTIONS.has(action) && method === 'POST' && !id) return `${documentPath}/${action}`;
  return null;
}

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const method = request.method.toUpperCase();
  const target = backendPath(method, path, new URL(request.url).search);
  if (!target) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const hasBody = method === 'PUT' || method === 'POST';
  const response = await proxyAdminRequest(request, target, {
    method,
    ...(hasBody
      ? { headers: { 'Content-Type': 'application/json' }, body: await request.text() }
      : {}),
  });

  const action = path[2];
  if (!response.ok || (action !== 'publish' && action !== 'unpublish')) {
    return response;
  }

  // Refresh public pages before answering, so the editor can say whether the
  // published change is already live.
  const payload = (await response.json()) as { affectedPaths?: string[] };
  const cache = refreshPublishedContent(path[1], payload.affectedPaths ?? []);
  return NextResponse.json(
    { ...payload, cache },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export const GET = handle;
export const PUT = handle;
export const POST = handle;
