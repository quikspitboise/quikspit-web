'use client'

import { SignIn as RealSignIn, UserButton as RealUserButton } from '@clerk/nextjs'

const enabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function SignIn(props: React.ComponentProps<typeof RealSignIn>) {
  if (!enabled) {
    return (
      <div className="text-center p-8 max-w-md mx-auto">
        <p className="text-white text-lg font-medium">Authentication not configured locally</p>
        <p className="text-neutral-400 text-sm mt-2">
          Set <code className="text-red-400">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in your environment to enable Clerk auth.
        </p>
      </div>
    )
  }
  return <RealSignIn {...props} />
}

export function UserButton(props: React.ComponentProps<typeof RealUserButton>) {
  if (!enabled) return null
  return <RealUserButton {...props} />
}
