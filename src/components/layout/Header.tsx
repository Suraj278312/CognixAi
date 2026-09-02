'use client';

import React from 'react';
import { PanelLeft, ChevronDown, Check, Sun, Moon, Settings, Brain } from 'lucide-react';
import { CognixLogo } from '@/components/ui/CognixLogo';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { siteConfig } from '@/config/site';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  webSearchEnabled?: boolean;
  onOpenSettings: () => void;
  onOpenMemoryManager: () => void;
  onSignOut?: () => void;
  conversationTitle?: string;
}

export function Header({
  onToggleSidebar,
  isSidebarOpen,
  selectedModel,
  onSelectModel,
  onOpenSettings,
  onOpenMemoryManager,
  onSignOut,
  conversationTitle = 'New Conversation',
}: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  const currentModel = siteConfig.models.find((m) => m.id === selectedModel) || siteConfig.models[0];

  const modelDropdownItems = siteConfig.models.map((m) => ({
    id: m.id,
    label: `${m.name}`,
    icon: m.id === selectedModel ? <Check className="w-3 h-3 text-brand" /> : undefined,
    onClick: () => onSelectModel(m.id),
  }));

  const userDropdownItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-3.5 h-3.5" />,
      onClick: onOpenSettings,
    },
    {
      id: 'memory',
      label: 'Memory',
      icon: <Brain className="w-3.5 h-3.5" />,
      onClick: onOpenMemoryManager,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      danger: true,
      onClick: () => {
        if (onSignOut) {
          onSignOut();
        }
      },
    },
  ];

  // Derive user initials
  const displayName: string = user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');
  const initials = displayName
    .split(' ')
    .filter((w: string) => w.length > 0)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-12 border-b border-border-subtle bg-background/80 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 select-none">
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Tooltip content={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors focus:outline-none"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </Tooltip>

        <div className="hidden sm:block">
          <CognixLogo size="sm" asLink={false} />
        </div>

        <div className="h-3.5 w-px bg-border-strong hidden sm:block" />

        {/* Model Selector Dropdown */}
        <Dropdown
          align="left"
          trigger={
            <button className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors">
              <span>{currentModel.name}</span>
              <ChevronDown className="w-3 h-3 text-foreground-muted" />
            </button>
          }
          items={modelDropdownItems}
        />
      </div>

      {/* Center: Conversation Title */}
      <div className="hidden md:block text-xs font-medium text-foreground-muted truncate max-w-xs text-center">
        {conversationTitle}
      </div>

      {/* Right: Theme Toggle & Avatar */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="p-1.5 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile Avatar */}
        <Dropdown
          align="right"
          trigger={
            <div className="w-7 h-7 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-[11px] font-semibold text-foreground cursor-pointer hover:border-foreground/30 transition-colors overflow-hidden">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          }
          items={userDropdownItems}
        />
      </div>
    </header>
  );
}
