import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

function getAdminUserIds(): string[] {
  return (process.env.CLERK_ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isConfiguredAdminUser(userId: string | null | undefined): boolean {
  if (!userId) {
    return false;
  }

  return getAdminUserIds().includes(userId);
}

export async function requireAdminPageAuth() {
  const authObject = await auth();

  if (!isConfiguredAdminUser(authObject.userId)) {
    notFound();
  }

  return authObject;
}

export async function getAdminApiAuth(): Promise<{
  userId: string;
  token: string;
} | null> {
  const authObject = await auth();
  const userId = authObject.userId;

  if (!userId || !isConfiguredAdminUser(userId)) {
    return null;
  }

  const token = await authObject.getToken();
  if (!token) {
    console.error('Clerk did not return a session token for admin API auth', {
      userId,
    });
    return null;
  }

  return {
    userId,
    token,
  };
}
