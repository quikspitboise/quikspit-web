import { env } from './env';

export function getBackendApiBaseUrl(): string {
  const trimmedBaseUrl = env.backendUrl.replace(/\/$/, '');
  return trimmedBaseUrl.endsWith('/api')
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/api`;
}

export function buildBackendApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${normalizedPath}`;
}
