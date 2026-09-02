'use client';

import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Brain,
  Shield,
  User,
  Sun,
  Moon,
  Laptop,
  Check,
  Trash2,
  Download,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/types/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemoryManager: () => void;
}

type SettingsTab = 'general' | 'appearance' | 'memory' | 'privacy' | 'account';

export function SettingsModal({ isOpen, onClose, onOpenMemoryManager }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const { theme, setTheme } = useTheme();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" /> },
    { id: 'privacy', label: 'Data & Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
  ];

  const themeOptions: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
    { id: 'light', label: 'Light Mode', icon: <Sun className="w-4 h-4" /> },
    { id: 'system', label: 'System Sync', icon: <Laptop className="w-4 h-4" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cognix Settings"
      description="Manage your appearance, cognitive memory, data privacy, and profile preferences."
      maxWidth="lg"
    >
      <div className="flex flex-col sm:flex-row gap-6 min-h-[320px]">
        {/* Settings Navigation Tabs (Left Sidebar) */}
        <div className="w-full sm:w-44 space-y-1 shrink-0 border-b sm:border-b-0 sm:border-r border-border-subtle pb-4 sm:pb-0 sm:pr-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left select-none ${
                activeTab === tab.id
                  ? 'bg-surface-2 text-brand font-semibold shadow-subtle'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-surface-2/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 space-y-4">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase font-mono tracking-wider">
                  Interface Theme
                </h4>
                <p className="text-xs text-foreground-muted mt-1">
                  Customize the appearance of Cognix for comfortable day or night reading.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-xs font-medium gap-2 ${
                      theme === opt.id
                        ? 'border-brand bg-brand/10 text-brand shadow-sm'
                        : 'border-border-strong bg-surface-2 text-foreground-secondary hover:text-foreground hover:border-foreground/30'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                    {theme === opt.id && <Check className="w-3.5 h-3.5 text-brand mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-foreground uppercase font-mono tracking-wider">
                  General Preferences
                </h4>
                <p className="text-foreground-muted mt-1">
                  Configure default model routing and streaming behavior.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-subtle">
                  <div>
                    <p className="font-semibold text-foreground">Auto-Scroll During Streaming</p>
                    <p className="text-foreground-muted text-[11px]">
                      Automatically keep viewport aligned to streaming tokens.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-subtle">
                  <div>
                    <p className="font-semibold text-foreground">Code Line Numbers</p>
                    <p className="text-foreground-muted text-[11px]">
                      Show line numbering inside syntax highlighted code blocks.
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* Memory Tab */}
          {activeTab === 'memory' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-foreground uppercase font-mono tracking-wider">
                  Cognitive Memory
                </h4>
                <p className="text-foreground-muted mt-1">
                  Cognix stores explicit personal facts and preferences to tailor responses.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle space-y-3">
                <p className="text-foreground-secondary leading-relaxed">
                  You can review all recorded facts, edit outdated context, or delete specific memories in the dedicated Memory Manager.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Brain className="w-3.5 h-3.5" />}
                  onClick={() => {
                    onClose();
                    onOpenMemoryManager();
                  }}
                >
                  Open Memory Manager
                </Button>
              </div>
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-foreground uppercase font-mono tracking-wider">
                  Data & Privacy
                </h4>
                <p className="text-foreground-muted mt-1">
                  Manage your data export and deletion rights.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border-subtle hover:bg-surface-3 transition-colors text-left">
                  <div>
                    <p className="font-semibold text-foreground">Export Chat History</p>
                    <p className="text-foreground-muted text-[11px]">Download all conversations as JSON archive</p>
                  </div>
                  <Download className="w-4 h-4 text-foreground-muted" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-status-error/30 hover:bg-status-error/10 transition-colors text-left text-status-error">
                  <div>
                    <p className="font-semibold">Clear All Conversations</p>
                    <p className="text-[11px] opacity-80">Permanently delete all message history</p>
                  </div>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-foreground uppercase font-mono tracking-wider">
                  User Account
                </h4>
                <p className="text-foreground-muted mt-1">
                  Logged in with Firebase Authentication.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-2 border border-border-subtle space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center text-sm">
                    SD
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Suraj Debnath</p>
                    <p className="text-foreground-muted text-[11px]">suraj@cognix.ai</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                  Delete Account Permanently
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
