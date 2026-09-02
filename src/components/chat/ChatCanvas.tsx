'use client';

import React from 'react';
import { EmptyStateHero } from '@/components/chat/EmptyStateHero';
import { MessageList } from '@/components/chat/MessageList';
import { ChatComposer } from '@/components/chat/ChatComposer';
import type { Message } from '@/types/chat';
import type { UploadedDocument } from '@/types/document';
import type { PendingImage } from '@/components/chat/ImageAttachmentPreview';

interface ChatCanvasProps {
  messages: Message[];
  input: string;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  onSelectPrompt: (prompt: string) => void;
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
  onRegenerate?: () => void;
}

export function ChatCanvas({
  messages,
  input,
  onInputChange,
  onSendMessage,
  onSelectPrompt,
  isStreaming,
  onStopStreaming,
  attachedDocs,
  onRemoveDoc,
  onOpenDocUpload,
  attachedImages,
  onAddImages,
  onRemoveImage,
  webSearchEnabled,
  onToggleWebSearch,
  onRegenerate,
}: ChatCanvasProps) {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] h-[calc(100dvh-3.5rem)] overflow-hidden bg-background">
      {/* Middle Scrollable Section: Empty State Hero vs Active Message Stream */}
      {messages.length === 0 ? (
        <EmptyStateHero onSelectPrompt={onSelectPrompt} />
      ) : (
        <MessageList messages={messages} onRegenerate={onRegenerate} />
      )}

      {/* Sticky Bottom Floating Composer */}
      <div className="p-4 bg-gradient-to-t from-background via-background/90 to-transparent shrink-0">
        <ChatComposer
          input={input}
          onInputChange={onInputChange}
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={onStopStreaming}
          attachedDocs={attachedDocs}
          onRemoveDoc={onRemoveDoc}
          onOpenDocUpload={onOpenDocUpload}
          attachedImages={attachedImages}
          onAddImages={onAddImages}
          onRemoveImage={onRemoveImage}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={onToggleWebSearch}
        />
      </div>
    </div>
  );
}
