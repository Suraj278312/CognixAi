'use client';

import React from 'react';
import { STARTER_PROMPTS } from '@/lib/constants';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CognixLogo } from '@/components/ui/CognixLogo';

interface EmptyStateHeroProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyStateHero({ onSelectPrompt }: EmptyStateHeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl mx-auto w-full text-center select-none">
      {/* Centered Brand Mark & Quiet Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-3 mb-8 flex flex-col items-center"
      >
        <div className="p-2 rounded-2xl bg-surface-2 border border-border-strong shadow-xs flex items-center justify-center">
          <CognixLogo variant="symbol" size="lg" asLink={false} />
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-sans">
          How can I help you today?
        </h1>
        <p className="text-xs text-foreground-secondary max-w-sm mx-auto leading-relaxed">
          Ask anything, explore an idea, or work with your documents.
        </p>
      </motion.div>

      {/* Lightweight Minimal Suggestion Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left"
      >
        {STARTER_PROMPTS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => onSelectPrompt(starter.prompt)}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-1 hover:bg-surface-2 border border-border-subtle hover:border-border-strong transition-all duration-150 group focus:outline-none focus-visible:ring-1 focus-visible:ring-brand shadow-xs"
          >
            <div className="min-w-0 pr-2">
              <h4 className="text-xs font-medium text-foreground group-hover:text-brand transition-colors truncate">
                {starter.title}
              </h4>
              <p className="text-[11px] text-foreground-muted truncate mt-0.5">
                {starter.description}
              </p>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-foreground-muted group-hover:text-foreground transition-colors shrink-0 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
      </motion.div>
    </div>
  );
}
