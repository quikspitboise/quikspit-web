import { ReactNode } from 'react'
import { ClerkProvider as RealClerkProvider } from '@clerk/nextjs'

const hasKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function ClerkProvider({ children }: { children: ReactNode }) {
  if (!hasKey) return <>{children}</>
  return <RealClerkProvider>{children}</RealClerkProvider>
}
