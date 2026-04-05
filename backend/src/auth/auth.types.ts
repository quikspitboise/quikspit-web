import type { Request } from 'express';

export interface ClerkSessionContext {
  userId: string;
  sessionId: string | null;
  authorizedParty?: string;
}

export interface AuthenticatedRequest extends Request {
  clerkAuth?: ClerkSessionContext;
}
