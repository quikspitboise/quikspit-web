"use client";

import React from "react";
import Image from "next/image";

/**
 * Brand Logo SVG
 * Accessible, scalable vector icon replacing the textual QuikSpit Shine wordmark in nav.
 */
export interface LogoProps {
  className?: string;
  /** Fixed pixel size (ignored when responsive=true). Default 56 */
  size?: number;
  /** Use responsive breakpoints instead of fixed size */
  responsive?: boolean;
  showText?: boolean;
}

export function Logo({ className, size = 56, responsive = true, showText = false }: LogoProps) {
  if (responsive) {
    return (
      <span
        className={`relative inline-flex items-center ${className ?? ''}`}
        style={{ lineHeight: 0 }}
      >
  <span className="relative block w-27 h-27 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-32 lg:h-32 xl:w-41 xl:h-41">
          <Image
            src="/logo.svg"
            alt="QuikSpit Shine"
            fill
            priority
            sizes="(max-width:640px) 3rem, (max-width:768px) 4rem, (max-width:1024px) 4rem, (max-width:1280px) 5rem, 6rem"
            className="object-contain select-none"
          />
        </span>
        {showText && (
          <span className="hidden md:inline ml-3 font-semibold text-xl tracking-tight">
            <span className="text-white">QuikSpit</span>
            <span className="text-red-600">Shine</span>
          </span>
        )}
        <span className="sr-only">QuikSpit Shine Home</span>
      </span>
    );
  }

  // Fixed-size fallback
  return (
    <span className={`inline-flex items-center ${className ?? ''}`} style={{ lineHeight: 0 }}>
      <Image
        src="/logo.svg"
        alt="QuikSpit Shine"
        width={size}
        height={size}
        priority
        className="object-contain select-none"
      />
      {showText && (
        <span className="ml-2 font-semibold text-lg tracking-tight">
          <span className="text-white">QuikSpit</span>
          <span className="text-red-600">Shine</span>
        </span>
      )}
      <span className="sr-only">QuikSpit Shine Home</span>
    </span>
  );
}

/* Inline SVG fallback (keep for quick switching / theming)
<svg className="w-12 h-12" viewBox="0 0 48 48" role="img" aria-hidden="true" focusable="false"> ... </svg>
*/

export default Logo;
