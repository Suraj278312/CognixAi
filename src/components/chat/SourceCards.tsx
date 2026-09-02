'use client';

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { extractCleanDomain, validateSafeUrl } from '@/lib/utils/url-validator';
import type { CitationSource } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SourceCardsProps {
  citations?: CitationSource[];
}

export function SourceCards({ citations }: SourceCardsProps) {
  if (!citations || citations.length === 0) return null;

  // Filter only valid web citations with secure URLs
  const webSources = citations.filter((c) => {
    if (c.type === 'document' && !c.url) return false;
    if (!c.url) return false;
    const { isValid } = validateSafeUrl(c.url);
    return isValid;
  });

  if (webSources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle/80 select-none">
      <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-foreground-secondary tracking-tight">
        <Globe className="w-3.5 h-3.5 text-brand" />
        <span>Sources</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {webSources.map((source, idx) => {
          const domain = source.domain || extractCleanDomain(source.url);
          const indexNum = idx + 1;

          return (
            <a
              key={source.id || `web-src-${idx}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group relative flex flex-col justify-between p-2.5 rounded-xl transition-all',
                'bg-surface-2 hover:bg-surface-3 border border-border-subtle hover:border-brand/40',
                'shadow-subtle hover:shadow-card focus:outline-none focus-visible:ring-1 focus-visible:ring-brand'
              )}
            >
              <div className="flex items-start gap-2 min-w-0">
                {/* Number Pill */}
                <span className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-mono font-semibold bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  {indexNum}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                    {source.title || domain}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border-subtle/40 text-[10px] text-foreground-muted font-mono">
                <span className="truncate max-w-[150px]">{domain}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
