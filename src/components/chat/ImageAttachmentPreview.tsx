'use client';

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  sizeBytes: number;
}

interface ImageAttachmentPreviewProps {
  image: PendingImage;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function ImageAttachmentPreview({
  image,
  onRemove,
  disabled = false,
}: ImageAttachmentPreviewProps) {
  const sizeMb = (image.sizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="group relative flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-surface-2 border border-border-strong hover:border-brand/40 transition-all select-none">
      {/* Thumbnail */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-surface-3 shrink-0 border border-border-subtle">
        {image.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.previewUrl}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-muted">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="min-w-0 max-w-[130px]">
        <p className="text-[12px] font-medium text-foreground truncate">{image.name}</p>
        <span className="text-[10px] text-foreground-muted font-mono">{sizeMb} MB</span>
      </div>

      {/* Remove Button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          aria-label={`Remove ${image.name}`}
          className="p-1 rounded-md text-foreground-muted hover:text-status-error hover:bg-surface-3 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
