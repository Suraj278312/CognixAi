'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pin,
  Settings,
  Brain,
  X,
} from 'lucide-react';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { Dropdown } from '@/components/ui/Dropdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Conversation } from '@/types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onRequestDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenMemoryManager: () => void;
  activeMemoriesCount?: number;
}

export function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onRequestDeleteConversation,
  onOpenSettings,
  onOpenMemoryManager,
  activeMemoriesCount,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const sevenDays = oneDay * 7;

  const todayList = filteredConversations.filter(
    (c) => now - new Date(c.updatedAt).getTime() < oneDay
  );
  const yesterdayList = filteredConversations.filter(
    (c) =>
      now - new Date(c.updatedAt).getTime() >= oneDay &&
      now - new Date(c.updatedAt).getTime() < oneDay * 2
  );
  const previousList = filteredConversations.filter(
    (c) =>
      now - new Date(c.updatedAt).getTime() >= oneDay * 2 &&
      now - new Date(c.updatedAt).getTime() < sevenDays
  );
  const olderList = filteredConversations.filter(
    (c) => now - new Date(c.updatedAt).getTime() >= sevenDays
  );

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const submitRename = (id: string) => {
    if (renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const renderConversationItem = (conv: Conversation) => {
    const isActive = activeConversationId === conv.id;

    if (renamingId === conv.id) {
      return (
        <div key={conv.id} className="px-2 py-1">
          <input
            type="text"
            value={renameValue}
            autoFocus
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => submitRename(conv.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename(conv.id);
              if (e.key === 'Escape') setRenamingId(null);
            }}
            className="w-full px-2 py-1 text-xs bg-surface-2 text-foreground rounded border border-brand/60 focus:outline-none"
          />
        </div>
      );
    }

    const actionItems = [
      {
        id: 'rename',
        label: 'Rename',
        icon: <Edit2 className="w-3 h-3" />,
        onClick: () => startRename(conv),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-3 h-3" />,
        danger: true,
        onClick: () => onRequestDeleteConversation(conv.id),
      },
    ];

    return (
      <div
        key={conv.id}
        className={cn(
          'group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none',
          isActive
            ? 'bg-surface-2 text-foreground font-medium'
            : 'text-foreground-secondary hover:text-foreground hover:bg-surface-2/60'
        )}
        onClick={() => onSelectConversation(conv.id)}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          {conv.isPinned ? (
            <Pin className="w-3 h-3 shrink-0 text-brand fill-brand" />
          ) : (
            <MessageSquare className="w-3 h-3 shrink-0 text-foreground-muted opacity-70 group-hover:opacity-100" />
          )}
          <span className="truncate text-[13px]">{conv.title}</span>
        </div>

        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            align="right"
            trigger={
              <button className="p-0.5 rounded text-foreground-muted hover:text-foreground hover:bg-surface-3">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            }
            items={actionItems}
          />
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-1 border-r border-border-subtle select-none">
      {/* Top Brand & Mobile Close */}
      <div className="p-3.5 flex items-center justify-between">
        <CognixLogo size="sm" />
        <button
          onClick={onClose}
          className="md:hidden p-1 text-foreground-muted hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat & Search Bar */}
      <div className="px-3 pb-2 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full h-8 px-2.5 flex items-center justify-between rounded-lg bg-surface-2 hover:bg-surface-3 text-foreground text-xs font-medium border border-border-subtle hover:border-border-strong transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-foreground-muted" />
            <span>New chat</span>
          </div>
          <span className="text-[10px] font-mono text-foreground-muted">Ctrl K</span>
        </button>

        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3 h-3 text-foreground-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-7 pr-2.5 text-xs bg-transparent text-foreground placeholder:text-foreground-muted border-b border-border-subtle rounded-none focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
      </div>

      {/* Conversations History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3 py-2">
        {filteredConversations.length === 0 ? (
          <div className="px-3 py-8 text-center space-y-1">
            <p className="text-xs text-foreground-muted">Your conversations will appear here.</p>
          </div>
        ) : (
          <>
            {todayList.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 text-[10px] uppercase font-mono font-medium text-foreground-muted tracking-wider">
                  Today
                </div>
                {todayList.map(renderConversationItem)}
              </div>
            )}

            {yesterdayList.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 text-[10px] uppercase font-mono font-medium text-foreground-muted tracking-wider">
                  Yesterday
                </div>
                {yesterdayList.map(renderConversationItem)}
              </div>
            )}

            {previousList.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 text-[10px] uppercase font-mono font-medium text-foreground-muted tracking-wider">
                  Previous 7 Days
                </div>
                {previousList.map(renderConversationItem)}
              </div>
            )}

            {olderList.length > 0 && (
              <div className="space-y-0.5">
                <div className="px-2 text-[10px] uppercase font-mono font-medium text-foreground-muted tracking-wider">
                  Older
                </div>
                {olderList.map(renderConversationItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Quiet Actions */}
      <div className="p-2 border-t border-border-subtle space-y-0.5 bg-surface-1">
        <button
          type="button"
          onClick={onOpenMemoryManager}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-foreground-muted" />
            <span>Memory</span>
          </div>
          {activeMemoriesCount !== undefined && activeMemoriesCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand/10 text-brand">
              {activeMemoriesCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors text-left"
        >
          <Settings className="w-3.5 h-3.5 text-foreground-muted" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 240 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
        className="hidden md:block shrink-0 h-full overflow-hidden z-30"
      >
        <div className="w-[240px] h-full">{sidebarContent}</div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              className="relative w-[260px] h-full shadow-floating z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
