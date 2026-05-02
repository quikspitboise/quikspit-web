import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminApiAuth } from '@/lib/server/admin-auth';

export const dynamic = 'force-dynamic';

const UPLOAD_FOLDER = 'quikspit/gallery';
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

function isSameOriginUrl(candidate: string, expectedOrigin: string): boolean {
  try {
    return new URL(candidate).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function validateAdminMutationOrigin(request: Request): NextResponse | null {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get('origin');

  if (originHeader) {
    return originHeader === requestOrigin
      ? null
      : NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const refererHeader = request.headers.get('referer');
  if (refererHeader && isSameOriginUrl(refererHeader, requestOrigin)) {
    return null;
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function signUploadParams(
  params: Record<string, string | number | boolean>,
  apiSecret: string,
): string {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export async function POST(request: Request) {
  const originValidationResponse = validateAdminMutationOrigin(request);
  if (originValidationResponse) {
    return originValidationResponse;
  }

  const adminAuth = await getAdminApiAuth();
  if (!adminAuth) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary upload signing is not configured' },
      { status: 500 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const uploadParams = {
    timestamp,
    folder: UPLOAD_FOLDER,
    allowed_formats: ALLOWED_FORMATS.join(','),
    unique_filename: true,
    overwrite: false,
  };

  return NextResponse.json({
    cloudName,
    apiKey,
    signature: signUploadParams(uploadParams, apiSecret),
    params: uploadParams,
    allowedFormats: ALLOWED_FORMATS,
  });
}
