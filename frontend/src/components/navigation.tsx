'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { useContext } from 'react'
import { TransitionContext } from './page-transition'
import { Logo } from './logo'

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isTransitioning } = useContext(TransitionContext)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/booking', label: 'Book Service' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <nav className={`bg-brand-charcoal/80 md:bg-brand-charcoal/85 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-b border-neutral-700 sticky top-0 z-50 shadow-sm ${isTransitioning ? 'pointer-events-none' : ''}`}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between h-[76px]">
          <Link
            href="/"
            className="group relative flex items-center"
            aria-label="QuikSpit Shine - Home"
          >
            <Logo responsive className="transition-transform duration-300 group-hover:scale-[1.04] active:scale-95" />
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}                className={`text-sm font-medium transition-colors duration-200 hover:text-red-600 focus:text-red-600 ${
                  pathname === item.href
                    ? 'text-red-600 border-b-2 border-red-600 pb-1'
                    : 'text-neutral-300'
                }`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-neutral-300 hover:text-red-600 focus:text-red-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal"
              aria-label="Open navigation menu"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden border-t border-neutral-700 py-4 space-y-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
          className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      pathname === item.href
            ? 'text-white bg-red-600/20 ring-1 ring-red-600/30'
            : 'text-neutral-300 hover:text-white hover:bg-red-600/10'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
