'use client';

import React from 'react';
import { FileText, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import type { UploadedDocument } from '@/types/document';

interface DocumentChipProps {
  document: UploadedDocument;
  onRemove: (id: string) => void;
  onRetry?: (doc: UploadedDocument) => void;
}

export function DocumentChip({ document, onRemove, onRetry }: DocumentChipProps) {
  const isFailed = document.status === 'error' || document.status === 'failed';
  const isProcessing = document.status === 'processing' || document.status === 'uploading';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium select-none shadow-subtle animate-fadeIn transition-colors ${
        isFailed
          ? 'bg-status-error/10 border-status-error/30 text-status-error'
          : 'bg-surface-2 border-border-strong text-foreground'
      }`}
    >
      <div
        className={`p-1 rounded ${
          isFailed
            ? 'bg-status-error/20 text-status-error'
            : 'bg-brand/10 text-brand'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
      </div>

      <span className="max-w-[140px] truncate" title={document.fileName}>
        {document.fileName}
      </span>

      <span className="text-[10px] text-foreground-muted font-mono">
        ({formatBytes(document.fileSizeBytes)})
      </span>

      {isProcessing && (
        <Tooltip content={document.status === 'uploading' ? 'Uploading PDF...' : 'Reading document...'}>
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-brand" />
            <span className="text-[10px] text-brand font-medium hidden sm:inline">
              {document.status === 'uploading' ? 'Uploading' : 'Indexing'}
            </span>
          </div>
        </Tooltip>
      )}

      {document.status === 'ready' && (
        <Tooltip content={document.pageCount ? `Ready (${document.pageCount} pages indexed)` : 'Ready to ask questions'}>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-status-success" />
            {document.pageCount && (
              <span className="text-[10px] text-status-success font-mono">
                {document.pageCount}p
              </span>
            )}
          </div>
        </Tooltip>
      )}

      {isFailed && (
        <Tooltip content={document.errorMessage || "Couldn't process this PDF"}>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-status-error" />
            {onRetry && (
              <button
                type="button"
                onClick={() => onRetry(document)}
                className="text-[10px] underline hover:no-underline font-medium ml-0.5"
              >
                Retry
              </button>
            )}
          </div>
        </Tooltip>
      )}

      <button
        type="button"
        onClick={() => onRemove(document.id)}
        aria-label="Remove document"
        className="p-0.5 rounded hover:bg-surface-3 text-foreground-muted hover:text-foreground transition-colors ml-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
