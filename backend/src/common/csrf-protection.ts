import type { INestApplication } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';
import type { LoggerService } from './logger.service';

// These mutations authenticate explicit bearer tokens in both Clerk guards.
// Keep this list scoped to those routes; cookie-authenticated routes need tokens.
const BEARER_MUTATIONS: Record<string, RegExp[]> = {
  POST: [
    /^\/api\/invoices(?:\/[^/]+\/send)?\/?$/,
    /^\/api\/gallery\/admin\/(?:items|reorder)\/?$/,
    /^\/api\/gallery\/admin\/items\/[^/]+\/assets\/?$/,
  ],
  PATCH: [
    /^\/api\/gallery\/admin\/items\/[^/]+\/?$/,
    /^\/api\/settings\/admin\/booking\/?$/,
  ],
  DELETE: [/^\/api\/gallery\/admin\/items\/[^/]+\/?$/],
};

function hasIndependentProtection(
  request: Request,
  allowedOrigins: string[],
): boolean {
  if (
    request.method === 'POST' &&
    /^\/api\/webhooks\/stripe\/?$/.test(request.path)
  ) {
    // The controller must verify Stripe's signature over the original raw body.
    return true;
  }

  if (
    /^Bearer [^\s]+$/i.test(request.get('authorization') || '') &&
    BEARER_MUTATIONS[request.method]?.some((route) => route.test(request.path))
  ) {
    // This is only a CSRF exemption. The controller still verifies the token
    // and administrator allowlist; a header alone never grants access.
    return true;
  }

  // These public forms do not use cookie identity. Permit the configured site's
  // browser submissions without requiring cross-site third-party cookies.
  return (
    request.method === 'POST' &&
    /^\/api\/(?:contact|bookings)\/?$/.test(request.path) &&
    allowedOrigins.includes(request.get('origin') || '')
  );
}

export function configureCsrfProtection(
  app: INestApplication,
  logger: LoggerService,
  allowedOrigins: string[],
): void {
  const enabled = process.env.ENABLE_CSRF === 'true';
  const secret = process.env.CSRF_SECRET || randomBytes(32).toString('hex');

  if (enabled && !process.env.CSRF_SECRET) {
    throw new Error('CSRF_SECRET must be configured when CSRF is enabled');
  }

  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => secret,
    cookieName: '_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (request) =>
      request.cookies?.sessionId || 'anonymous',
    skipCsrfProtection: (request) =>
      hasIndependentProtection(request, allowedOrigins),
  });

  app.getHttpAdapter().getInstance().locals.generateCsrfToken =
    generateCsrfToken;

  if (enabled) {
    app.use(doubleCsrfProtection);
    logger.log('CSRF Protection enabled');
  } else {
    logger.warn(
      'CSRF Protection is DISABLED - enable in production with ENABLE_CSRF=true',
    );
  }
}
