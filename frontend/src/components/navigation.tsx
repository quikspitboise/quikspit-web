'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Logo } from './logo'

const navItems = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const BOOK_HREF = '/booking#design-your-detail'

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navigation() {
  const pathname = usePathname()
  const [menuState, setMenuState] = useState({ open: false, pathname })
  const [scrolled, setScrolled] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Close the menu on route change, during render rather than in an effect.
  if (menuState.pathname !== pathname) {
    setMenuState({ open: false, pathname })
  }
  const menuOpen = menuState.open
  const setMenuOpen = (open: boolean) => setMenuState({ open, pathname })

  useEffect(() => {
    // A sentinel at the top of the page is cheaper than a scroll listener.
    const sentinel = document.getElementById('nav-scroll-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setMenuState((state) => ({ ...state, open: false }))
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const bookingActive = pathname === '/booking'

  return (
    <>
      <div id="nav-scroll-sentinel" aria-hidden="true" className="absolute top-0 h-px w-px" />
      <nav
        aria-label="Primary"
        className={`fixed top-0 left-0 right-0 z-50 [transform:translateZ(0)] pt-[var(--nav-safe-offset)] bg-black border-b transition-[border-color] duration-300 ${
          scrolled || menuOpen ? 'border-white/10' : 'border-transparent'
        }`}
      >
        {/* Over-viewport black backing: iOS Safari transiently misplaces the
            whole fixed layer while revealing the URL toolbar on scroll-up
            (WebKit bug 297779 family). Painting solid black far above the
            header means any such offset exposes black, never page content. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-[50vh] bg-black" />
        {/* Opaque safe-area backing so scrolled content never shows through
            above the logo bar on notched iPhones. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[var(--nav-safe-offset)] bg-black" />

        <div className="relative container mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[var(--nav-bar-height)]">
            <Link href="/" className="flex items-center rounded-md" aria-label="QuikSpit Auto Detailing, home">
              <Logo responsive />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-4 py-2 text-[0.9375rem] font-medium transition-colors duration-200 ${
                      active ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute left-4 right-4 -bottom-0.5 h-0.5 bg-red-500 origin-left transition-transform duration-300 ease-out-expo ${
                        active ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </Link>
                )
              })}
              <Link
                href={BOOK_HREF}
                aria-current={bookingActive ? 'page' : undefined}
                className="btn-primary ml-4 inline-flex min-h-10 items-center px-4 text-sm"
              >
                Book a detail
              </Link>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="lg:hidden -mr-2 flex h-11 w-11 items-center justify-center rounded-md text-white"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="relative block h-3.5 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out-expo ${
                    menuOpen ? 'translate-y-[6px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out-expo ${
                    menuOpen ? '-translate-y-[6px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              className="mobile-menu-shell lg:hidden absolute top-full inset-x-0 overflow-hidden border-b border-white/10"
              initial={prefersReducedMotion ? { opacity: 0 } : { height: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto' }}
              exit={prefersReducedMotion ? { opacity: 0 } : { height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="container mx-auto px-5 sm:px-6 pt-2 pb-6">
                <ul>
                  {navItems.map((item, index) => {
                    const active = isActive(pathname, item.href)
                    return (
                      <motion.li
                        key={item.href}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * index + 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-white/[0.07]"
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-4 text-lg font-medium ${
                            active ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {item.label}
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />}
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
                <Link
                  href={BOOK_HREF}
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary mt-6 flex min-h-12 w-full items-center justify-center"
                >
                  Book a detail
                </Link>
                <a href="tel:+12089604970" className="mt-4 block py-2 text-center text-neutral-400">
                  Or call (208) 960-4970
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-[var(--nav-total-height)]" />
    </>
  )
}
