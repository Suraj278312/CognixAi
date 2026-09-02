'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from '@/components/chat/Message';
import { ArrowDown } from 'lucide-react';
import type { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  onRegenerate?: () => void;
}

export function MessageList({ messages, onRegenerate }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageCount = useRef(messages.length);

  // Check scroll position to determine if user scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 120; // px from bottom
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom <= threshold;

    setIsAtBottom(isNearBottom);
    setShowScrollButton(distanceFromBottom > 240);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  // Handle auto-scroll on new messages or streaming chunks
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCount.current;
    lastMessageCount.current = messages.length;

    // If new user message added, always scroll to bottom
    if (isNewMessage && messages[messages.length - 1]?.role === 'user') {
      scrollToBottom(false);
      setIsAtBottom(true);
      return;
    }

    // Only auto-scroll streaming updates if user was already at bottom
    if (isAtBottom) {
      scrollToBottom(false);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-2"
    >
      <div className="max-w-3xl mx-auto w-full">
        {messages.map((message) => (
          <Message key={message.id} message={message} onRegenerate={onRegenerate} />
        ))}
        <div ref={bottomRef} className="h-6" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => {
            scrollToBottom(true);
            setIsAtBottom(true);
            setShowScrollButton(false);
          }}
          aria-label="Scroll to newest messages"
          className="fixed bottom-28 right-8 z-30 p-2 rounded-full bg-surface-2 hover:bg-surface-3 border border-border-strong text-foreground shadow-floating transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
