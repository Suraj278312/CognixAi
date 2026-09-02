'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, Globe, Image as ImageIcon } from 'lucide-react';
import { CodeBlock } from '@/components/chat/CodeBlock';
import { StreamingIndicator } from '@/components/chat/StreamingIndicator';
import { CitationPopover } from '@/components/chat/CitationPopover';
import { SourceCards } from '@/components/chat/SourceCards';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Message } from '@/types/chat';

interface AssistantMessageProps {
  message: Message;
  onRegenerate?: () => void;
}

export function AssistantMessage({ message, onRegenerate }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy response', err);
    }
  };

  /**
   * Helper to replace citation markers like [1], [2] or [Doc.pdf · p. 12] in text with CitationPopover
   */
  const processTextWithCitations = (text: string) => {
    if (!text || typeof text !== 'string') return text;

    // Matches [1], [2] or [Filename.pdf · p. 12] or [Filename.pdf, p. 12]
    const citationRegex = /\[(\d+)\]|\[([^\]]+(?:\.pdf|\.PDF)[^\]]*[·,]\s*p\.?\s*(\d+))\]/g;
    const segments = [];
    let lastIdx = 0;
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        segments.push(text.slice(lastIdx, match.index));
      }

      if (match[1]) {
        // Numbered citation [1]
        const citNum = parseInt(match[1], 10);
        const source = message.citations && message.citations[citNum - 1];

        if (source) {
          segments.push(
            <CitationPopover key={`cit-${match.index}`} index={citNum} source={source} />
          );
        } else {
          segments.push(`[${citNum}]`);
        }
      } else if (match[2]) {
        // Document page citation [Filename.pdf · p. 12]
        const fullLabel = match[2];
        const pageNum = match[3] ? parseInt(match[3], 10) : undefined;
        // Look up corresponding citation in message.citations if available
        const matchedSource = message.citations?.find(
          (c) =>
            (c.pageNumber === pageNum &&
              fullLabel.toLowerCase().includes(c.documentName?.toLowerCase() || '')) ||
            c.title?.toLowerCase().includes(fullLabel.toLowerCase())
        );

        const source = matchedSource || {
          id: `cit-${match.index}`,
          type: 'document' as const,
          title: fullLabel,
          pageNumber: pageNum,
          snippet: 'Grounded document excerpt referenced in answer.',
        };

        segments.push(
          <CitationPopover
            key={`cit-${match.index}`}
            label={`[${fullLabel}]`}
            source={source}
          />
        );
      }

      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      segments.push(text.slice(lastIdx));
    }

    if (segments.length === 0) return text;
    return segments.map((seg, i) =>
      typeof seg === 'string' ? seg : <React.Fragment key={i}>{seg}</React.Fragment>
    );
  };

  const isImageStatus = message.searchStatus?.toLowerCase().includes('image');

  return (
    <div className="flex gap-3.5 my-6 group text-left">
      {/* Minimalist Assistant Indicator */}
      <div className="w-6 h-6 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center shrink-0 mt-1 select-none">
        <div className="w-2 h-2 rounded-full bg-brand" />
      </div>

      {/* Open Message Body */}
      <div className="flex-1 min-w-0">
        {/* Subtle Status Pill */}
        {message.searchStatus && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-[11px] font-medium animate-pulse select-none">
            {isImageStatus ? (
              <ImageIcon className="w-3.5 h-3.5" />
            ) : (
              <Globe className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>{message.searchStatus}</span>
          </div>
        )}

        <div className="prose-cognix">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !String(children).includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="text-xs px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle font-mono text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    language={match ? match[1] : 'text'}
                    code={String(children).replace(/\n$/, '')}
                  />
                );
              },
              p({ children }) {
                return (
                  <p className="my-2.5 leading-relaxed text-[14.5px] text-foreground font-sans">
                    {React.Children.map(children, (child) => {
                      if (typeof child === 'string') {
                        return processTextWithCitations(child);
                      }
                      return child;
                    })}
                  </p>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-base font-semibold text-foreground tracking-tight mt-4 mb-2 border-b border-border-subtle pb-1">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-sm font-semibold text-foreground tracking-tight mt-3 mb-1">
                    {children}
                  </h3>
                );
              },
              ul({ children }) {
                return (
                  <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-[14px] text-foreground-secondary">
                    {children}
                  </ul>
                );
              },
              ol({ children }) {
                return (
                  <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-[14px] text-foreground-secondary">
                    {children}
                  </ol>
                );
              },
              li({ children }) {
                return (
                  <li className="text-[14px] text-foreground leading-relaxed">
                    {React.Children.map(children, (child) => {
                      if (typeof child === 'string') {
                        return processTextWithCitations(child);
                      }
                      return child;
                    })}
                  </li>
                );
              },
              table({ children }) {
                return (
                  <div className="my-3 overflow-x-auto rounded-lg border border-border-strong">
                    <table className="w-full text-xs text-left border-collapse">{children}</table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 bg-surface-2 text-foreground font-semibold border-b border-border-strong">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 border-b border-border-subtle text-foreground-secondary">
                    {children}
                  </td>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-brand/60 pl-3 my-2.5 text-xs text-foreground-secondary italic">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Streaming Token Indicator */}
        {message.isStreaming && <StreamingIndicator />}

        {/* Compact Grounded Source Cards Section */}
        {message.citations && message.citations.length > 0 && (
          <SourceCards citations={message.citations} />
        )}

        {/* Minimal Quiet Action Toolbar */}
        {!message.isStreaming && message.content && (
          <div className="mt-2.5 flex items-center gap-1.5 text-foreground-muted select-none opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip content="Copy message">
              <button
                onClick={handleCopy}
                className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-status-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>

            {onRegenerate && (
              <Tooltip content="Regenerate">
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}

            <div className="h-3 w-px bg-border-subtle mx-0.5" />

            <Tooltip content="Helpful">
              <button
                onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                className={`p-1 rounded transition-colors ${
                  feedback === 'like' ? 'text-brand' : 'hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <Tooltip content="Not helpful">
              <button
                onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                className={`p-1 rounded transition-colors ${
                  feedback === 'dislike'
                    ? 'text-status-error'
                    : 'hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
