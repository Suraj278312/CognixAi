'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-sensitive diagnostic info in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error Boundary caught error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-12 selection:bg-brand selection:text-white">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <CognixLogo size="md" />
      </div>

      {/* Main Error Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12 space-y-6">
        <div className="p-3 rounded-2xl bg-status-error/10 border border-status-error/20 shadow-xs flex items-center justify-center text-status-error">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-medium text-status-error uppercase tracking-wider">
            Application Exception
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            An unexpected error occurred while rendering this view. Your session and data are secure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full justify-center"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-center"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-foreground-muted select-none">
        © {new Date().getFullYear()} Cognix AI • System Resilience
      </div>
    </div>
  );
}
