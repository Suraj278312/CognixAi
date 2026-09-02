'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Globe,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { DocumentChip } from '@/features/documents/DocumentChip';
import {
  ImageAttachmentPreview,
  type PendingImage,
} from '@/components/chat/ImageAttachmentPreview';
import { Tooltip } from '@/components/ui/Tooltip';
import { Dropdown } from '@/components/ui/Dropdown';
import type { UploadedDocument } from '@/types/document';
import { cn } from '@/lib/utils';
import { MULTIMODAL_CONFIG } from '@/config/multimodal';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  attachedDocs: UploadedDocument[];
  onRemoveDoc: (id: string) => void;
  onOpenDocUpload: () => void;
  attachedImages?: PendingImage[];
  onAddImages?: (files: File[]) => void;
  onRemoveImage?: (id: string) => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatComposer({
  input,
  onInputChange,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  attachedDocs,
  onRemoveDoc,
  onOpenDocUpload,
  attachedImages = [],
  onAddImages,
  onRemoveImage,
  webSearchEnabled,
  onToggleWebSearch,
  placeholder = 'Ask anything, attach an image or PDF...',
  disabled = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const hasContent = input.trim().length > 0 || attachedImages.length > 0;
      if (hasContent && !isStreaming && !disabled) {
        onSendMessage();
      }
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAddImages) {
      const files = Array.from(e.target.files);
      onAddImages(files);
      e.target.value = '';
    }
  };

  // Clipboard Paste Support (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0 && onAddImages) {
      const imageFiles = Array.from(e.clipboardData.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        e.preventDefault();
        onAddImages(imageFiles);
      }
    }
  };

  // Drag and Drop Support
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isStreaming) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (disabled || isStreaming) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const images = files.filter((f) => f.type.startsWith('image/'));
      if (images.length > 0 && onAddImages) {
        onAddImages(images);
      }
    }
  };

  const canSend = (input.trim().length > 0 || attachedImages.length > 0) && !disabled && !isStreaming;

  const attachmentMenuItems = [
    {
      id: 'image',
      label: 'Upload Image',
      icon: <ImageIcon className="w-4 h-4 text-brand" />,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      id: 'document',
      label: 'Upload PDF Document',
      icon: <FileText className="w-4 h-4 text-brand" />,
      onClick: onOpenDocUpload,
    },
  ];

  return (
    <div className="relative max-w-2xl mx-auto w-full px-4 select-none">
      {/* Hidden Native Image File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept={MULTIMODAL_CONFIG.supportedMimeTypes.join(',')}
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Floating Quiet Composer Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl bg-surface-1 border shadow-elevated transition-all',
          isDraggingOver
            ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
            : 'border-border-strong focus-within:border-brand/50'
        )}
      >
        {/* Attached Document & Image Chips */}
        {(attachedDocs.length > 0 || attachedImages.length > 0) && (
          <div className="flex flex-wrap gap-2 px-3.5 pt-2.5 pb-1.5 border-b border-border-subtle">
            {attachedDocs.map((doc) => (
              <DocumentChip key={doc.id} document={doc} onRemove={onRemoveDoc} />
            ))}

            {attachedImages.map((img) => (
              <ImageAttachmentPreview
                key={img.id}
                image={img}
                onRemove={(id) => onRemoveImage && onRemoveImage(id)}
                disabled={disabled || isStreaming}
              />
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={disabled}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              attachedImages.length > 0
                ? 'Ask about this image, or press Enter to analyze...'
                : placeholder
            }
            className="w-full bg-transparent text-foreground placeholder:text-foreground-muted text-[14px] leading-relaxed resize-none focus:outline-none max-h-[160px] min-h-[32px]"
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            {/* Attachment Dropdown Button */}
            <Dropdown
              side="top"
              align="left"
              items={attachmentMenuItems}
              trigger={
                <button
                  type="button"
                  disabled={disabled || isStreaming}
                  aria-label="Add attachment"
                  className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              }
            />

            <Tooltip content={webSearchEnabled ? 'Web search enabled' : 'Enable web search'}>
              <button
                type="button"
                onClick={onToggleWebSearch}
                disabled={disabled || isStreaming}
                aria-label={webSearchEnabled ? 'Disable web search' : 'Enable web search'}
                aria-pressed={webSearchEnabled}
                className={cn(
                  'p-1.5 rounded-md transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand cursor-pointer',
                  webSearchEnabled
                    ? 'text-brand bg-brand/10'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-2'
                )}
              >
                <Globe className="w-4 h-4" />
              </button>
            </Tooltip>

            {webSearchEnabled && (
              <span className="text-[11px] text-brand font-medium ml-1">Search on</span>
            )}
          </div>

          {/* Right Action: Send / Stop */}
          <div>
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                aria-label="Stop generation"
                className="w-7 h-7 rounded-lg bg-surface-3 hover:bg-status-error hover:text-white text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSendMessage}
                disabled={!canSend}
                aria-label="Send message"
                className="w-7 h-7 rounded-lg bg-foreground text-background hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
