import React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface SearchToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function SearchToggle({ enabled, onToggle, disabled }: SearchToggleProps) {
  return (
    <Tooltip content={enabled ? 'Grounded Web Search (Active)' : 'Enable Grounded Web Search'}>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-pressed={enabled}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand select-none',
          enabled
            ? 'bg-brand/15 text-brand border border-brand/40 shadow-sm shadow-brand/10'
            : 'bg-surface-2 hover:bg-surface-3 text-foreground-muted hover:text-foreground border border-border-subtle hover:border-border-strong'
        )}
      >
        <Globe className={cn('w-3.5 h-3.5', enabled ? 'text-brand animate-pulse-subtle' : 'text-foreground-muted')} />
        <span className="hidden sm:inline">Web Search</span>
        {enabled && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
        )}
      </button>
    </Tooltip>
  );
}
