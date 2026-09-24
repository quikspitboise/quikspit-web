import Link from 'next/link'
import type { Metadata } from 'next'
import { MagneticButton } from '@/components/ui/magnetic-button'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for could not be found.',
}

const links = [
  { href: '/pricing', label: 'Prices' },
  { href: '/booking#design-your-detail', label: 'Book a detail' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-[70vh]">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-32">
        <p className="font-display text-[clamp(5rem,20vw,12rem)] text-red-600 tabular" aria-hidden="true">404</p>
        <h1 className="mt-4 font-display text-3xl sm:text-5xl text-white uppercase">This page isn&apos;t here</h1>
        <p className="mt-5 max-w-lg text-lg text-neutral-400 text-pretty">
          The link may be old, or the address may have a typo. These pages might be what you were after.
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-red-400">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <MagneticButton href="/">Go to the home page</MagneticButton>
        </div>
      </div>
    </main>
  )
}
