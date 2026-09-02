'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-border-strong bg-[#09090b] font-mono text-[13px] leading-relaxed group shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#121215] border-b border-border-subtle select-none">
        <span className="text-[11px] font-mono text-foreground-muted lowercase">
          {language}
        </span>

        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1 text-[11px] text-foreground-muted hover:text-foreground transition-colors p-1 rounded hover:bg-surface-2 focus:outline-none"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-status-success" />
              <span className="text-status-success text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[#f4f4f5]">
        <pre className="m-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
