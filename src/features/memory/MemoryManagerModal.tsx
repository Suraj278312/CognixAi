'use client';

import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Search,
  Plus,
  Loader2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useMemory } from '@/hooks/useMemory';
import type { MemoryCategory, MemoryItem } from '@/types/memory';

interface MemoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'preference', label: 'Preferences' },
  { id: 'project', label: 'Projects' },
  { id: 'goal', label: 'Goals' },
  { id: 'skill', label: 'Skills' },
  { id: 'profile', label: 'Profile' },
  { id: 'instruction', label: 'Instructions' },
];

export function MemoryManagerModal({ isOpen, onClose }: MemoryManagerModalProps) {
  const {
    filteredMemories,
    settings,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeMemoriesCount,
    toggleMasterMemory,
    addMemory,
    updateMemoryItem,
    deleteMemoryItem,
    clearAllMemories,
  } = useMemory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  const startEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      updateMemoryItem(id, { content: editText.trim() });
    }
    setEditingId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    await addMemory(newContent.trim(), newCategory);
    setNewContent('');
    setIsAdding(false);
  };

  const handleClearAllConfirm = async () => {
    await clearAllMemories();
    setIsConfirmingClearAll(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Long-Term Memory Management"
      description="Cognix remembers useful preferences and project context across chats. You have 100% control over what is stored."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Master Memory Switch */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Long-Term Memory Personalization
                </h4>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-brand/15 text-brand">
                  {activeMemoriesCount} active
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted">
                {settings.isMemoryEnabled
                  ? 'Cognix is actively learning and applying preferences across conversations.'
                  : 'Memory is paused. No memories will be created or used.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.isMemoryEnabled}
            aria-label="Toggle Long-Term Memory"
            onClick={() => toggleMasterMemory(!settings.isMemoryEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand ${
              settings.isMemoryEnabled ? 'bg-brand' : 'bg-surface-3'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.isMemoryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Header: Search, Category Filters, Add Memory */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border-subtle rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand"
              />
            </div>

            {/* Add Memory Button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAdding(!isAdding)}
            >
              Add Memory
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-brand text-white'
                    : 'bg-surface-2 text-foreground-muted hover:text-foreground hover:bg-surface-3'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* New Memory Inline Form */}
          {isAdding && (
            <form
              onSubmit={handleAddSubmit}
              className="p-3.5 rounded-lg bg-surface-2 border border-brand/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">
                  Create Explicit Memory
                </span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="text-[11px] bg-surface-1 border border-border-strong rounded px-2 py-0.5 text-foreground focus:outline-none focus:border-brand"
                >
                  <option value="preference">Preference</option>
                  <option value="project">Project</option>
                  <option value="goal">Goal</option>
                  <option value="skill">Skill</option>
                  <option value="profile">Profile</option>
                  <option value="instruction">Instruction</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="e.g. User prefers concise TypeScript examples with Tailwind"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-surface-1 border border-border-strong rounded-md text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-brand"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={!newContent.trim()}>
                  Save Memory
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Memories List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
              Saved Memories ({filteredMemories.length})
            </h4>

            {filteredMemories.length > 0 && (
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(true)}
                className="text-[11px] text-status-error hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center gap-2 text-xs text-foreground-muted">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Loading memories...</span>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface-2 border border-border-subtle space-y-2">
              <Sparkles className="w-6 h-6 text-foreground-muted mx-auto" />
              <p className="text-xs text-foreground-muted">No memories found.</p>
              <p className="text-[11px] text-foreground-muted max-w-xs mx-auto">
                {searchQuery
                  ? 'No memories matched your search criteria.'
                  : 'As you converse with Cognix, persistent preferences and project details will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {filteredMemories.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all text-xs ${
                    item.isActive
                      ? 'bg-surface-2 border-border-strong'
                      : 'bg-surface-2/40 border-border-subtle opacity-60'
                  }`}
                >
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-surface-1 border border-brand rounded text-foreground focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        className="p-1 text-status-success hover:bg-surface-3 rounded cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-foreground-muted hover:bg-surface-3 rounded cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <p className="text-foreground leading-relaxed font-sans">{item.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="brand" size="sm">
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-foreground-muted font-mono">
                            {item.source === 'explicit'
                              ? 'Explicit request'
                              : item.source === 'user_edited'
                              ? 'Edited by you'
                              : 'From conversation'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateMemoryItem(item.id, { isActive: !item.isActive })}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            item.isActive
                              ? 'bg-brand/10 text-brand hover:bg-brand/20'
                              : 'bg-surface-3 text-foreground-muted hover:text-foreground'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          aria-label="Edit memory"
                          className="p-1 text-foreground-muted hover:text-foreground rounded hover:bg-surface-3 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMemoryItem(item.id)}
                          aria-label="Delete memory"
                          className="p-1 text-foreground-muted hover:text-status-error rounded hover:bg-surface-3 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Transparency Notice */}
        <div className="p-3 rounded-lg bg-surface-2/60 border border-border-subtle text-[11px] text-foreground-muted flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <span>
            Cognix never stores raw conversational logs or passwords in memory. Only high-signal personal preferences are extracted and kept strictly isolated to your user ID.
          </span>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {isConfirmingClearAll && (
        <Modal
          isOpen={isConfirmingClearAll}
          onClose={() => setIsConfirmingClearAll(false)}
          title="Delete All Long-Term Memories?"
          description="This will permanently delete all saved preferences, project context, and memories associated with your account. This action cannot be undone."
          maxWidth="sm"
        >
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmingClearAll(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleClearAllConfirm}
            >
              Delete All Memories
            </Button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
