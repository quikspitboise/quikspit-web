import type { Request, Response, NextFunction, Express } from 'express';

export function configureProxyTrust(app: Express): void {
  const proxies = (process.env.TRUST_PROXY || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  // An address allowlist is safe on variable-length ingress paths. Hop counts
  // and trust-all cannot distinguish a direct request from the intended proxy.
  if (proxies.some((value) => /^(true|false|\d+)$/i.test(value))) {
    throw new Error(
      'TRUST_PROXY must contain trusted proxy IP addresses or CIDR ranges',
    );
  }
  app.set('trust proxy', proxies.length ? proxies : false);
}

export function canonicalHttpsRedirect() {
  if (process.env.ENFORCE_HTTPS !== 'true') return null;
  let origin: URL;
  try {
    origin = new URL(process.env.CANONICAL_API_ORIGIN || '');
  } catch {
    throw new Error('ENFORCE_HTTPS requires CANONICAL_API_ORIGIN');
  }
  if (
    origin.protocol !== 'https:' ||
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new Error(
      'CANONICAL_API_ORIGIN must be an HTTPS origin without a path or credentials',
    );
  }
  const destination = origin.origin;
  return (request: Request, response: Response, next: NextFunction): void => {
    if (request.secure) {
      next();
      return;
    }
    // Concatenation preserves the configured origin even for //evil.test paths.
    const path = request.originalUrl.startsWith('/')
      ? request.originalUrl
      : '/';
    response.redirect(308, destination + path);
  };
}
