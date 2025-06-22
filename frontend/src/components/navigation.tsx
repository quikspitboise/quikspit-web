'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/booking', label: 'Book Service' },
    { href: '/contact', label: 'Contact' },
  ]
  return (
    <nav className="bg-neutral-800/95 backdrop-blur-md border-b border-neutral-700 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold text-white hover:text-red-600 transition-colors duration-200"
            aria-label="QuikSpit Shine - Home"
          >            <span className="text-white">QuikSpit</span>
            <span className="text-red-600 ml-1">Shine</span>
          </Link>
          
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
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              type="button"
              className="text-neutral-300 hover:text-red-600 focus:text-red-600 p-2"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - you can expand this later */}
        <div className="md:hidden border-t border-neutral-700 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'text-red-600 bg-red-600/5'
                  : 'text-neutral-300 hover:text-red-600 hover:bg-red-600/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
      </div>
    </nav>
  )
}
