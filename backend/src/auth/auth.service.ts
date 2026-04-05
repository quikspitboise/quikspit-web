import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import type { Request } from 'express';
import { LoggerService } from '../common/logger.service';
import type { ClerkSessionContext } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly logger: LoggerService) {}

  getBearerToken(request: Request): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  async authenticateClerkRequest(
    request: Request,
  ): Promise<ClerkSessionContext> {
    const token = this.getBearerToken(request);
    const publishableKey =
      process.env.CLERK_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    const jwtKey = process.env.CLERK_JWT_KEY;
    const authorizedParties = this.getAuthorizedParties();

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    if (!publishableKey) {
      throw new InternalServerErrorException(
        'Clerk publishable key is not configured',
      );
    }

    if (!secretKey && !jwtKey) {
      throw new InternalServerErrorException(
        'Clerk server credentials are not configured',
      );
    }

    if (authorizedParties.length === 0) {
      throw new InternalServerErrorException(
        'Clerk authorized parties are not configured',
      );
    }

    const clerkRequest = this.toClerkRequest(request);
    clerkRequest.headers.set('authorization', `Bearer ${token}`);

    const clerkClient = createClerkClient({
      publishableKey,
      ...(secretKey ? { secretKey } : {}),
      ...(jwtKey ? { jwtKey } : {}),
    });

    const requestState = await clerkClient.authenticateRequest(clerkRequest, {
      authorizedParties,
      acceptsToken: 'session_token',
      clockSkewInMs: 5000,
    });

    if (!requestState.isAuthenticated) {
      this.logger.warn('Clerk token verification failed', {
        reason: requestState.reason,
        message: requestState.message,
      });
      throw new UnauthorizedException('Invalid authentication token');
    }

    const authObject = requestState.toAuth();
    if (!authObject.userId) {
      throw new UnauthorizedException('Authenticated user is missing');
    }

    const sessionClaims = authObject.sessionClaims as
      | { azp?: string }
      | null
      | undefined;

    return {
      userId: authObject.userId,
      sessionId: authObject.sessionId ?? null,
      authorizedParty:
        typeof sessionClaims?.azp === 'string'
          ? sessionClaims.azp
          : undefined,
    };
  }

  private toClerkRequest(request: Request): globalThis.Request {
    const protocolHeader = request.headers['x-forwarded-proto'];
    const protocol = Array.isArray(protocolHeader)
      ? protocolHeader[0]
      : protocolHeader || request.protocol || 'http';
    const hostHeader = request.headers.host;

    if (!hostHeader) {
      throw new BadRequestException('Host header is required');
    }

    const url = `${protocol}://${hostHeader}${request.originalUrl || request.url}`;
    const headers = new Headers();

    for (const [name, value] of Object.entries(request.headers)) {
      if (value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          headers.append(name, entry);
        }
        continue;
      }

      headers.set(name, value);
    }

    return new Request(url, {
      method: request.method,
      headers,
    });
  }

  ensureAdminUser(userId: string): void {
    const adminUserIds = this.getAdminUserIds();

    if (adminUserIds.length === 0) {
      throw new InternalServerErrorException(
        'No Clerk admin users are configured',
      );
    }

    if (!adminUserIds.includes(userId)) {
      throw new NotFoundException('Resource not found');
    }
  }

  private getAdminUserIds(): string[] {
    return (process.env.CLERK_ADMIN_USER_IDS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private getAuthorizedParties(): string[] {
    return (process.env.CLERK_AUTHORIZED_PARTIES || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
}
