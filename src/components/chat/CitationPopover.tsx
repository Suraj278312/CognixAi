'use client';

import React, { useState } from 'react';
import { ExternalLink, FileText, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CitationSource } from '@/types/chat';

interface CitationPopoverProps {
  index?: number | string;
  label?: string;
  source: CitationSource;
}

export function CitationPopover({ index, label, source }: CitationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isDoc = !!source.pageNumber || !!source.documentId;
  const badgeText = label || (index !== undefined ? `[${index}]` : '[Source]');

  return (
    <span
      className="relative inline-block mx-0.5 align-baseline select-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Citation Pill Badge */}
      <button
        type="button"
        onClick={() => {
          if (source.url) window.open(source.url, '_blank', 'noopener,noreferrer');
        }}
        className={cn(
          'inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono font-medium rounded transition-all max-w-[200px] truncate',
          'bg-brand/10 text-brand hover:bg-brand/20 border border-brand/30 hover:border-brand',
          'cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-brand'
        )}
      >
        {badgeText}
      </button>

      {/* Popover Preview Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-surface-2 border border-border-strong rounded-lg shadow-floating z-50 text-left pointer-events-auto"
          >
            <div className="flex items-start gap-2 mb-1.5">
              {isDoc ? (
                <div className="p-1 rounded bg-brand/10 text-brand shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-1 rounded bg-brand-accent/10 text-brand-accent shrink-0 mt-0.5">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-semibold text-foreground truncate">
                  {source.documentName || source.title}
                </h5>
                <p className="text-[10px] text-foreground-muted font-mono">
                  {source.pageNumber ? `Source Page ${source.pageNumber}` : source.domain || 'Verified Web Source'}
                </p>
              </div>
            </div>

            {source.snippet && (
              <p className="text-[11px] text-foreground-secondary line-clamp-4 leading-relaxed border-t border-border-subtle pt-1.5 mt-1.5 font-sans">
                &ldquo;{source.snippet}&rdquo;
              </p>
            )}

            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-brand hover:underline"
              >
                <span>Visit Source</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
