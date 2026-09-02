'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-12 selection:bg-brand selection:text-white">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <CognixLogo size="md" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main 404 Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-12 space-y-6">
        <div className="p-3 rounded-2xl bg-surface-2 border border-border-strong shadow-xs flex items-center justify-center">
          <CognixLogo variant="symbol" size="lg" asLink={false} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-medium text-brand uppercase tracking-wider">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
            Lost in the intelligent space
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
            The page or conversation you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
          <Link href="/chat" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Open AI Workspace
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full justify-center">
              Return Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-[11px] text-foreground-muted select-none">
        © {new Date().getFullYear()} Cognix AI • Calm, Grounded Intelligence
      </div>
    </div>
  );
}
