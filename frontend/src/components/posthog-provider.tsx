'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Initialize PostHog on the client side.
 * Wrapped in a check so it only runs once and only in the browser.
 */
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,   // We capture manually below for SPA nav
    capture_pageleave: true,
  });
}

/**
 * Captures a pageview on every client-side route change.
 * Wrapped in <Suspense> because useSearchParams() needs it in Next.js App Router.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) {
        url += '?' + search;
      }
      ph.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

/**
 * PostHog analytics provider — wraps the app to enable
 * pageview tracking and the PostHog React hooks.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // If no key is configured, skip PostHog entirely
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
