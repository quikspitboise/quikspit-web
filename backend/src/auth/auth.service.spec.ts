import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { AuthService } from './auth.service';

jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(),
}));

describe('AuthService', () => {
  const authenticateRequestMock = jest.fn();
  const createClerkClientMock = createClerkClient as jest.MockedFunction<
    typeof createClerkClient
  >;
  const loggerMock = {
    error: jest.fn(),
    warn: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_publishable';
    process.env.CLERK_SECRET_KEY = 'sk_test_secret';
    process.env.CLERK_JWT_KEY = 'jwt_test_key';
    process.env.CLERK_ADMIN_USER_IDS = 'user_owner,user_partner';
    process.env.CLERK_AUTHORIZED_PARTIES = 'http://localhost:3000';
    createClerkClientMock.mockReturnValue({
      authenticateRequest: authenticateRequestMock,
    } as any);
    service = new AuthService(loggerMock as any);
  });

  it('extracts a bearer token from the Authorization header', () => {
    expect(
      service.getBearerToken({
        headers: {
          authorization: 'Bearer test-token',
        },
      } as any),
    ).toBe('test-token');
  });

  it('verifies Clerk tokens and maps the authenticated session context', async () => {
    authenticateRequestMock.mockResolvedValue({
      isAuthenticated: true,
      toAuth: () => ({
        userId: 'user_owner',
        sessionId: 'sess_123',
        sessionClaims: {
          azp: 'http://localhost:3000',
        },
      }),
    } as any);

    await expect(
      service.authenticateClerkRequest({
        method: 'GET',
        protocol: 'http',
        originalUrl: '/api/gallery/admin/items',
        url: '/api/gallery/admin/items',
        headers: {
          host: 'localhost:3001',
          authorization: 'Bearer token-value',
        },
      } as any),
    ).resolves.toEqual({
      userId: 'user_owner',
      sessionId: 'sess_123',
      authorizedParty: 'http://localhost:3000',
    });
  });

  it('rejects users who are not on the admin allowlist', () => {
    expect(() => service.ensureAdminUser('user_stranger')).toThrow(
      NotFoundException,
    );
  });

  it('fails closed when Clerk authorized parties are not configured', async () => {
    process.env.CLERK_AUTHORIZED_PARTIES = '';

    await expect(
      service.authenticateClerkRequest({
        method: 'GET',
        protocol: 'http',
        originalUrl: '/api/gallery/admin/items',
        url: '/api/gallery/admin/items',
        headers: {
          host: 'localhost:3001',
          authorization: 'Bearer token-value',
        },
      } as any),
    ).rejects.toThrow(InternalServerErrorException);

    expect(authenticateRequestMock).not.toHaveBeenCalled();
  });

  it('fails closed when the admin allowlist is not configured', () => {
    process.env.CLERK_ADMIN_USER_IDS = '';

    expect(() => service.ensureAdminUser('user_owner')).toThrow(
      InternalServerErrorException,
    );
  });
});
