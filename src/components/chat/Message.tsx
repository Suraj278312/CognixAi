import React from 'react';
import { UserMessage } from '@/components/chat/UserMessage';
import { AssistantMessage } from '@/components/chat/AssistantMessage';
import type { Message as MessageType } from '@/types/chat';

interface MessageProps {
  message: MessageType;
  onRegenerate?: () => void;
}

export function Message({ message, onRegenerate }: MessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }

  return <AssistantMessage message={message} onRegenerate={onRegenerate} />;
}
