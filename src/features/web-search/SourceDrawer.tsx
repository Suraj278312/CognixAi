'use client';

import React, { useState } from 'react';
import { ChevronDown, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CitationSource } from '@/types/chat';

interface SourceDrawerProps {
  sources: CitationSource[];
}

export function SourceDrawer({ sources }: SourceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-3 border border-border-subtle rounded-lg bg-surface-1 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-brand-accent" />
          <span>Grounded Web Sources ({sources.length})</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-foreground-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border-subtle divide-y divide-border-subtle bg-surface-2/40"
          >
            {sources.map((source, idx) => (
              <div key={source.id || idx} className="p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground truncate pr-2">
                    [{idx + 1}] {source.title}
                  </span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline shrink-0"
                    >
                      <span>{source.domain || 'Source'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <p className="text-foreground-muted text-[11px] leading-relaxed line-clamp-2">
                  {source.snippet}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
