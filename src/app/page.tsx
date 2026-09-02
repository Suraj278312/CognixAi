'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Globe,
  Brain,
  Zap,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HeroBackground } from '@/components/background/HeroBackground';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Subtle scroll-driven entrance for product preview
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { y: 60, opacity: 0.8, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: previewRef.current,
            start: 'top 85%',
            end: 'top 50%',
            scrub: 0.5,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-brand" />,
      title: 'Fluid Conversational AI',
      description:
        'Sub-second streaming powered by Google Gemini. Complete Markdown, LaTeX mathematical rendering, and syntax-highlighted code blocks.',
      badge: 'Streaming Engine',
    },
    {
      icon: <FileText className="w-5 h-5 text-brand-accent" />,
      title: 'Document Intelligence (RAG)',
      description:
        'Upload PDFs up to 10MB. Cognix extracts, chunks with 150-char sliding overlap, indexes embeddings, and delivers answers grounded with page citations.',
      badge: 'PDF QA',
    },
    {
      icon: <Globe className="w-5 h-5 text-status-success" />,
      title: 'Grounded Web Search',
      description:
        'Connects directly to live web sources for breaking facts and real-time knowledge. Zero fake links with interactive [1], [2] citation badges.',
      badge: 'Live Grounding',
    },
    {
      icon: <Brain className="w-5 h-5 text-status-warning" />,
      title: 'Long-Term Memory Profile',
      description:
        'Remembers your workflow preferences and skills across conversations without storing raw chat logs. Inspect, edit, or purge memories at any time.',
      badge: 'Persistent Context',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand selection:text-white">
      {/* Top Header */}
      <Navigation />

      <main className="flex-1">
        {/* ==================================================================
            1. HERO SECTION
            ================================================================== */}
        <section
          ref={heroRef}
          className="relative isolate pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-visible"
        >
          {/* Ambient AI & Orbital Background System */}
          <HeroBackground />

          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-surface-2 border border-border-strong text-foreground shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Introducing Cognix 1.0 • Powered by Google Gemini & Firebase
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-sans max-w-4xl leading-[1.1]"
          >
            Your intelligent space to{' '}
            <span className="bg-gradient-to-r from-brand via-brand-hover to-brand-accent bg-clip-text text-transparent">
              think, explore, and create.
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-foreground-muted max-w-2xl leading-relaxed"
          >
            A calm, distraction-free AI assistant designed for students, developers, and researchers.
            Experience natural streaming conversations, document intelligence for PDFs, real-time grounded search, and persistent long-term memory.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3.5"
          >
            <Link href="/chat">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Chatting Free
              </Button>
            </Link>

            <Link href="#product">
              <Button variant="secondary" size="lg">
                Explore Product Architecture
              </Button>
            </Link>
          </motion.div>

          {/* ================================================================
              2. INTERACTIVE PRODUCT PREVIEW DEMO
              ================================================================ */}
          <div
            id="product"
            ref={previewRef}
            className="mt-16 sm:mt-24 w-full max-w-5xl rounded-2xl bg-surface-1 border border-border-strong shadow-floating overflow-hidden text-left"
          >
            {/* Window Topbar */}
            <div className="h-10 bg-surface-2/80 border-b border-border-subtle px-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-error/60" />
                <div className="w-3 h-3 rounded-full bg-status-warning/60" />
                <div className="w-3 h-3 rounded-full bg-status-success/60" />
                <span className="text-xs text-foreground-muted ml-2 font-mono font-medium">
                  cognix.ai/chat
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-foreground-secondary font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand" /> Gemini 1.5 Flash
                </span>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 sm:p-8 space-y-6 bg-background/50">
              {/* User Message Bubble */}
              <div className="flex justify-end">
                <div className="bg-surface-2 border border-border-strong rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-xl text-foreground shadow-subtle">
                  Explain how RAG chunking works with a 150-character overlap for PDF documents.
                </div>
              </div>

              {/* Assistant Message Bubble */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-strong flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand" />
                </div>
                <div className="space-y-3 flex-1 text-sm text-foreground leading-relaxed">
                  <h4 className="font-semibold text-foreground tracking-tight">
                    Document Chunking & Semantic Continuity
                  </h4>
                  <p>
                    When segmenting complex PDFs into discrete chunks for vector search, a <strong>150-character overlap</strong> ensures unbroken sentence boundaries and context retention across sliding windows.
                  </p>

                  <div className="rounded-lg bg-[#090d16] border border-border-strong p-3.5 font-mono text-xs text-[#e2e8f0]">
                    <div className="text-foreground-muted mb-1 text-[11px]">{'// TypeScript Recursive Chunker'}</div>
                    <code>{`export function chunkText(text: string, chunkSize = 800, overlap = 150): string[]`}</code>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 text-[11px] font-mono">
                      [1] RAG_Guidelines.pdf (p. 4)
                    </span>
                    <span className="text-[11px] text-status-success font-medium">
                      ✓ Evidence Grounded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. FOUR PILLARS / FEATURES GRID
            ================================================================== */}
        <section id="features" ref={featuresRef} className="py-20 sm:py-28 bg-surface-1/50 border-t border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <Badge variant="brand" size="md">
                Core Architecture
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
                Engineered for depth, speed, and privacy
              </h2>
              <p className="text-sm text-foreground-muted">
                Cognix unifies four essential AI systems into an integrated, calm workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-border-strong hover:border-brand/50 transition-all duration-300 shadow-subtle hover:shadow-elevated space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-surface-2 group-hover:bg-surface-3 transition-colors">
                      {feature.icon}
                    </div>
                    <Badge variant="outline" size="sm">
                      {feature.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground tracking-tight group-hover:text-brand transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. PRODUCT PHILOSOPHY & ETHICS
            ================================================================== */}
        <section id="philosophy" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="brand" size="md">
                Design Philosophy
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans leading-tight">
                Calm Intelligence. Zero noise. Absolute sovereignty.
              </h2>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Most AI assistants overwhelm users with noisy sidebars, cluttered popups, and dark patterns. Cognix is built from the ground up to feel minimal, editorial, and trustworthy.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Zero Model Training on Private Data</h4>
                    <p className="text-xs text-foreground-muted">Your private conversations and uploaded PDF documents are never used to train foundation models.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">100% Memory Transparency</h4>
                    <p className="text-xs text-foreground-muted">Inspect every fact Cognix learns about you. Edit wording or purge memory at any time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Zero Hallucinated Web Citations</h4>
                    <p className="text-xs text-foreground-muted">Every web search citation links to a verified, accessible source with genuine publisher attribution.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Stack Callout Card */}
            <div className="p-8 rounded-2xl bg-surface-1 border border-border-strong shadow-floating space-y-6">
              <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                <Terminal className="w-5 h-5 text-brand" />
                <h4 className="text-sm font-semibold text-foreground font-mono">Cognix Foundation Specs</h4>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-foreground-muted">AI Reasoner:</span>
                  <span className="text-foreground font-semibold">Google Gemini 1.5 (Flash / Pro)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-foreground-muted">Embeddings:</span>
                  <span className="text-foreground font-semibold">text-embedding-004 (768-dim)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-foreground-muted">Cloud & Database:</span>
                  <span className="text-foreground font-semibold">Firebase (Auth, Firestore, Storage)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-foreground-muted">Frontend Engine:</span>
                  <span className="text-foreground font-semibold">Next.js App Router (TypeScript)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-foreground-muted">Design Tokens:</span>
                  <span className="text-brand font-semibold">Tailored HSL (Dark / Light)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. FINAL CTA SECTION
            ================================================================== */}
        <section className="py-20 sm:py-24 bg-surface-2/60 border-t border-border-subtle text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
              Start thinking with Cognix today.
            </h2>
            <p className="text-sm text-foreground-muted max-w-xl mx-auto leading-relaxed">
              Join students, developers, and researchers using a clean, grounded AI workspace. Completely free to use.
            </p>
            <div className="pt-2 flex items-center justify-center gap-4">
              <Link href="/chat">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Launch Assistant
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
