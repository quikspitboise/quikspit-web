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
        className={`relative inline-flex items-center shrink-0 ${className ?? ''}`}
        style={{ lineHeight: 0 }}
      >
        <span className="relative block h-[64px] w-[200px] sm:h-[64px] sm:w-[220px] md:h-[64px] md:w-[240px] lg:h-[64px] lg:w-[240px] xl:h-[68px] xl:w-[260px]">
          <Image
            src="/logo.svg"
            alt="QuikSpit Shine"
            fill
            priority
            sizes="(max-width:640px) 200px, (max-width:768px) 220px, (max-width:1024px) 240px, (max-width:1280px) 240px, 260px"
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
