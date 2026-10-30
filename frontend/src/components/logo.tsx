import Image from "next/image";

export interface LogoProps {
  className?: string;
  /** Fixed pixel height (ignored when responsive=true). Default 56 */
  size?: number;
  /** Use responsive breakpoints instead of a fixed size */
  responsive?: boolean;
}

// logo.svg viewBox is 265 x 120
const ASPECT = 265 / 120;

/**
 * Brand logo. Decorative by default: every caller wraps it in a link that
 * carries its own accessible name.
 */
export function Logo({ className = "", size = 56, responsive = true }: LogoProps) {
  if (responsive) {
    return (
      <span className={`relative block h-16 w-[142px] shrink-0 ${className}`}>
        <Image
          src="/logo.svg"
          alt=""
          fill
          priority
          sizes="142px"
          className="object-contain select-none"
        />
      </span>
    );
  }

  return (
    <Image
      src="/logo.svg"
      alt=""
      width={Math.round(size * ASPECT)}
      height={size}
      className={`object-contain select-none ${className}`}
    />
  );
}

export default Logo;
