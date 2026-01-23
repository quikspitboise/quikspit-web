'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { TransitionContext } from './page-transition'
import { Logo } from './logo'

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isTransitioning } = useContext(TransitionContext);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/booking', label: 'Book Service' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 to-red-500 origin-left z-[100]"
        style={{ scaleX: useScroll().scrollYProgress }}
      />
      
      <motion.nav 
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out
          ${scrolled 
            ? 'glass-nav-scrolled bg-[rgba(10,10,10,0.95)] border-b border-white/5' 
            : 'bg-transparent border-b border-transparent'
          }
          ${isTransitioning ? 'pointer-events-none' : ''}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo */}
            <Link
              href="/"
              className="group relative flex items-center"
              aria-label="QuikSpit Shine - Home"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Logo responsive className="transition-all duration-300" />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium tracking-wide
                    transition-colors duration-300
                    ${pathname === item.href
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                    }
                  `}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Active/Hover underline */}
                  <motion.span
                    className="absolute bottom-0 left-1/2 h-[2px] bg-red-600 rounded-full"
                    initial={false}
                    animate={{
                      width: pathname === item.href ? '60%' : '0%',
                      x: '-50%',
                    }}
                    whileHover={{
                      width: '60%',
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </Link>
              ))}
              
              {/* CTA Button */}
              <motion.div
                className="ml-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/booking#design-your-detail"
                  className="
                    inline-flex items-center gap-2 px-5 py-2.5
                    bg-red-600 hover:bg-red-500
                    text-white text-sm font-semibold
                    rounded-lg transition-all duration-300
                    shadow-lg shadow-red-600/20 hover:shadow-red-600/30
                  "
                >
                  Book Now
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              className="
                md:hidden relative w-10 h-10
                flex items-center justify-center
                text-white rounded-lg
                hover:bg-white/5 transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-600/50
              "
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <motion.span
                  className="w-full h-0.5 bg-current rounded-full origin-center"
                  animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-current rounded-full"
                  animate={menuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-current rounded-full origin-center"
                  animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden absolute top-full left-0 right-0 bg-[rgba(10,10,10,0.98)] backdrop-blur-xl border-b border-white/5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="container mx-auto px-4 py-6 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        block px-4 py-3 rounded-xl
                        text-base font-medium tracking-wide
                        transition-all duration-300
                        ${pathname === item.href
                          ? 'text-white bg-red-600/10 border-l-2 border-red-600'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                      onClick={() => setMenuOpen(false)}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.05 + 0.1, duration: 0.3 }}
                  className="pt-4"
                >
                  <Link
                    href="/booking#design-your-detail"
                    className="
                      block w-full text-center px-6 py-4
                      bg-red-600 hover:bg-red-500
                      text-white font-semibold
                      rounded-xl transition-all duration-300
                    "
                    onClick={() => setMenuOpen(false)}
                  >
                    Book Your Service
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Spacer for fixed nav */}
      <div className="h-[76px]" />
    </>
  );
}
