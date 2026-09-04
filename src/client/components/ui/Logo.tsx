import Image from "next/image";
import { cn } from "@/lib/cn";

export interface LogoProps {
  height?: number;
  src?: string;
  wordmarkOnly?: boolean;
  className?: string;
}

/* The only brand mark supplied by the client: a transparent PNG at 246x107. There is no SVG
   and no icon-only variant — see src/design/readme.md -> "Assets". */
export function Logo({ height = 30, src = "/elkaro-logo.png", wordmarkOnly = false, className }: LogoProps) {
  if (wordmarkOnly) {
    return (
      <span
        className={ cn("inline-flex items-baseline gap-1.5 font-sans font-bold tracking-[-0.03em] text-text-strong", className) }
        style={ { fontSize: height * 0.62 } }
      >
        <span className="font-medium text-text-subtle" style={ { fontSize: height * 0.36 } }>
          SIA
        </span>
        <span>
          Elkaro<span className="text-orange-500">.</span>
        </span>
      </span>
    );
  }

  return (
    <Image
      src={ src }
      alt="SIA Elkaro"
      height={ height }
      width={ Math.round(height * (246 / 107)) }
      className={ cn("block", className) }
      priority
    />
  );
}
