import React from 'react';
import Link from 'next/link';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { Github, Twitter, Sparkles, Shield, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-1 py-12 sm:py-16 text-foreground-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1 space-y-4">
            <CognixLogo size="md" />
            <p className="text-foreground-muted leading-relaxed max-w-sm">
              Your intelligent space to think, explore, and create. Built on Google Gemini and Firebase with calm, distraction-free principles.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border-subtle text-[11px] text-foreground font-mono">
                <Cpu className="w-3 h-3 text-brand" /> Gemini 1.5
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border-subtle text-[11px] text-foreground font-mono">
                <Shield className="w-3 h-3 text-brand-accent" /> Zero-Trust
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground tracking-tight text-sm">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="hover:text-foreground transition-colors">
                  AI Chatbot
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Document Intelligence (RAG)
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Grounded Web Search
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Cross-Session Memory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Docs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground tracking-tight text-sm">Architecture</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/PRD.md" className="hover:text-foreground transition-colors">
                  Product Scope (PRD)
                </Link>
              </li>
              <li>
                <Link href="/DESIGN.md" className="hover:text-foreground transition-colors">
                  Design System Tokens
                </Link>
              </li>
              <li>
                <Link href="/ARCHITECTURE.md" className="hover:text-foreground transition-colors">
                  System Data Flows
                </Link>
              </li>
              <li>
                <Link href="/SECURITY.md" className="hover:text-foreground transition-colors">
                  Security & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Project */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground tracking-tight text-sm">Open Architecture</h4>
            <p className="text-foreground-muted leading-relaxed">
              Cognix is an open-spec AI engineering project designed for modern developers and researchers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md bg-surface-2 hover:bg-surface-3 text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md bg-surface-2 hover:bg-surface-3 text-foreground transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-foreground-muted">
          <p>© {new Date().getFullYear()} Cognix AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="flex items-center gap-1 text-foreground-secondary">
              <Sparkles className="w-3 h-3 text-brand" /> Calm Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
