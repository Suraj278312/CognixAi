'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { MemoryItem, MemoryCategory, MemorySettings } from '@/types/memory';

const DEFAULT_SETTINGS: MemorySettings = {
  isMemoryEnabled: true,
  maxActiveMemories: 50,
  confidenceThreshold: 0.7,
};

export function useMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [settings, setSettings] = useState<MemorySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const userId = user?.uid;

  /**
   * Load user memories and settings
   */
  const loadData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch memories and settings in parallel
      const [memRes, setRes] = await Promise.all([
        fetch(`/api/memory?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/memory/settings?userId=${encodeURIComponent(userId)}`),
      ]);

      if (memRes.ok) {
        const data = await memRes.json();
        if (Array.isArray(data.memories)) {
          setMemories(data.memories);
        }
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.settings) {
          setSettings(setData.settings);
        }
      }
    } catch (err) {
      console.warn('Failed to load memory data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Toggle master memory recording switch
   */
  const toggleMasterMemory = useCallback(
    async (enabled: boolean) => {
      setSettings((prev) => ({ ...prev, isMemoryEnabled: enabled }));

      if (!userId) return;

      try {
        await fetch('/api/memory/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, isMemoryEnabled: enabled }),
        });
      } catch (err) {
        console.warn('Failed to update memory master toggle:', err);
      }
    },
    [userId]
  );

  /**
   * Explicitly add a memory
   */
  const addMemory = useCallback(
    async (content: string, category: MemoryCategory = 'preference') => {
      if (!userId || !content.trim()) return null;

      try {
        const res = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            content: content.trim(),
            category,
            source: 'explicit',
            confidence: 1.0,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.memory) {
            setMemories((prev) => {
              const existingIdx = prev.findIndex((m) => m.id === data.memory.id);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = data.memory;
                return next;
              }
              return [data.memory, ...prev];
            });
            return data.memory as MemoryItem;
          }
        }
      } catch (err) {
        console.warn('Failed to add explicit memory:', err);
      }
      return null;
    },
    [userId]
  );

  /**
   * Update an existing memory
   */
  const updateMemoryItem = useCallback(
    async (id: string, updates: Partial<Pick<MemoryItem, 'content' | 'category' | 'isActive'>>) => {
      // Optimistic update
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: Date.now(), source: 'user_edited' } : m))
      );

      if (!userId) return;

      try {
        await fetch(`/api/memory/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...updates }),
        });
      } catch (err) {
        console.warn('Failed to update memory item:', err);
      }
    },
    [userId]
  );

  /**
   * Delete a single memory
   */
  const deleteMemoryItem = useCallback(
    async (id: string) => {
      // Optimistic update
      setMemories((prev) => prev.filter((m) => m.id !== id));

      if (!userId) return;

      try {
        await fetch(`/api/memory/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete memory item:', err);
      }
    },
    [userId]
  );

  /**
   * Clear all memories
   */
  const clearAllMemories = useCallback(async () => {
    // Optimistic update
    setMemories([]);

    if (!userId) return;

    try {
      await fetch('/api/memory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, confirm: true }),
      });
    } catch (err) {
      console.warn('Failed to clear all memories:', err);
    }
  }, [userId]);

  /**
   * Filtered memories list based on search and category
   */
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesCategory =
        selectedCategory === 'all' || m.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [memories, selectedCategory, searchQuery]);

  const activeMemoriesCount = useMemo(() => {
    return memories.filter((m) => m.isActive).length;
  }, [memories]);

  return {
    memories,
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
    reload: loadData,
  };
}
