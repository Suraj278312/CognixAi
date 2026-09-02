import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CognixLogoProps {
  className?: string;
  imageClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol';
  asLink?: boolean;
  href?: string;
  showBadge?: boolean;
  badgeText?: string;
}

const SIZE_MAP = {
  xs: { height: 22, symbolSize: 22 },
  sm: { height: 28, symbolSize: 28 },
  md: { height: 34, symbolSize: 34 },
  lg: { height: 42, symbolSize: 42 },
  xl: { height: 54, symbolSize: 54 },
};

export function CognixLogo({
  className,
  imageClassName,
  size = 'md',
  variant = 'full',
  asLink = true,
  href = '/',
  showBadge = false,
  badgeText = 'AI',
}: CognixLogoProps) {
  const { height, symbolSize } = SIZE_MAP[size] || SIZE_MAP.md;

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none shrink-0 group', className)}>
      {variant === 'symbol' ? (
        /* Standalone Abstract Geometric Symbol */
        <div
          style={{ width: symbolSize, height: symbolSize }}
          className="relative shrink-0 flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cognix-symbol.png"
            alt="Cognix Symbol"
            style={{ width: symbolSize, height: symbolSize }}
            className={cn('object-contain', imageClassName)}
          />
        </div>
      ) : (
        /* Full Logo Lockup (Symbol + Wordmark) — Theme Adaptive & Tightly Trimmed */
        <div
          style={{ height }}
          className="relative shrink-0 flex items-center"
        >
          {/* Dark theme logo (White wordmark + vibrant gradient symbol) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cognix-logo-dark.png"
            alt="Cognix"
            style={{ height, width: 'auto' }}
            className={cn('hidden dark:block object-contain max-h-none', imageClassName)}
          />
          {/* Light theme logo (Obsidian wordmark + vibrant gradient symbol) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cognix-logo.png"
            alt="Cognix"
            style={{ height, width: 'auto' }}
            className={cn('block dark:hidden object-contain max-h-none', imageClassName)}
          />
        </div>
      )}

      {showBadge && (
        <span className="text-[10px] uppercase font-mono font-medium tracking-wider px-1.5 py-0.5 rounded-full bg-surface-2 text-foreground-muted border border-border-subtle shrink-0">
          {badgeText}
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return content;
}
