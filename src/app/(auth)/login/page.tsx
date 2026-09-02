'use client';

import React from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { CognixLogo } from '@/components/ui/CognixLogo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <CognixLogo size="md" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Centered Form */}
      <div className="flex-1 flex items-center justify-center my-8">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-foreground-muted select-none">
        © {new Date().getFullYear()} Cognix AI • Secured with Firebase Authentication
      </div>
    </div>
  );
}
