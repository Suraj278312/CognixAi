/**
 * Memory Service & Personalization Orchestrator — Cognix Phase 6
 * Manages Firestore persistence, deduplication, conflict resolution, settings, and selective retrieval.
 * Source of truth: docs/ai/MEMORY.md
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { checkMemorySensitivity } from './sensitive-filter';
import type {
  MemoryItem,
  MemoryCandidate,
  MemorySettings,
} from '@/types/memory';

const DEFAULT_MEMORY_SETTINGS: MemorySettings = {
  isMemoryEnabled: true,
  maxActiveMemories: 50,
  confidenceThreshold: 0.7,
};

// In-memory fallback store for local development or unauthenticated/server-side instances
const memoryFallbackStore = new Map<string, Map<string, MemoryItem>>();
const settingsFallbackStore = new Map<string, MemorySettings>();
const isBrowser = typeof window !== 'undefined';

/**
 * Normalizes text for similarity comparison (lowercased, stripped punctuation)
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Jaccard token overlap between two strings (0.0 to 1.0)
 */
function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeForComparison(a).split(' '));
  const wordsB = new Set(normalizeForComparison(b).split(' '));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * 1. Fetch user's memory settings
 */
export async function getMemorySettings(userId: string): Promise<MemorySettings> {
  if (!userId) {
    return { ...DEFAULT_MEMORY_SETTINGS };
  }

  if (db && isBrowser) {
    try {
      const settingsDocRef = doc(db, 'users', userId, 'settings', 'personalization');
      const snap = await getDoc(settingsDocRef);

      if (snap.exists()) {
        const merged = { ...DEFAULT_MEMORY_SETTINGS, ...(snap.data() as Partial<MemorySettings>) };
        settingsFallbackStore.set(userId, merged);
        return merged;
      }
    } catch {
      // Fallback path
    }
  }

  return settingsFallbackStore.get(userId) || { ...DEFAULT_MEMORY_SETTINGS };
}

/**
 * 2. Update user's memory settings
 */
export async function updateMemorySettings(
  userId: string,
  updates: Partial<MemorySettings>
): Promise<MemorySettings> {
  const current = await getMemorySettings(userId);
  const updated: MemorySettings = { ...current, ...updates };

  settingsFallbackStore.set(userId, updated);

  if (db && userId && isBrowser) {
    try {
      const settingsDocRef = doc(db, 'users', userId, 'settings', 'personalization');
      await setDoc(settingsDocRef, updated, { merge: true });
    } catch {
      // Fallback path
    }
  }

  return updated;
}

/**
 * 3. Fetch all memories for a user
 */
export async function getMemories(
  userId: string,
  options: { activeOnly?: boolean; limitCount?: number } = {}
): Promise<MemoryItem[]> {
  if (!userId) return [];

  const results: MemoryItem[] = [];

  if (db && isBrowser) {
    try {
      const memoriesRef = collection(db, 'users', userId, 'memories');
      let q = query(memoriesRef, orderBy('updatedAt', 'desc'));

      if (options.activeOnly) {
        q = query(memoriesRef, where('isActive', '==', true), orderBy('updatedAt', 'desc'));
      }

      if (options.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as MemoryItem);
      });
    } catch {
      // Fallback path
    }
  }

  if (results.length === 0) {
    const userMap = memoryFallbackStore.get(userId) || new Map();
    let items = Array.from(userMap.values());
    if (options.activeOnly) {
      items = items.filter((m) => m.isActive);
    }
    items = items.sort((a, b) => b.updatedAt - a.updatedAt);
    if (options.limitCount) {
      items = items.slice(0, options.limitCount);
    }
    return items;
  }

  return results;
}

function cleanFirestoreData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

/**
 * 4. Save memory with deduplication, conflict resolution, and capacity limits
 */
export async function saveMemory(
  userId: string,
  candidate: MemoryCandidate,
  conversationId?: string
): Promise<MemoryItem | null> {
  if (!userId || !candidate.content) return null;

  // Validate sensitivity
  const safety = checkMemorySensitivity(candidate.content);
  if (!safety.isSafe) {
    console.warn('Memory rejected due to sensitive data:', safety.reason);
    return null;
  }

  // Check if memory recording is enabled
  const settings = await getMemorySettings(userId);
  if (!settings.isMemoryEnabled) {
    return null;
  }

  const existingMemories = await getMemories(userId);

  // A. Conflict Resolution & Deduplication Check
  // Check for high semantic overlap or same category conflict
  let matchToUpdate: MemoryItem | null = null;

  for (const existing of existingMemories) {
    const similarity = calculateSimilarity(existing.content, candidate.content);

    // If similarity is high (> 0.55) or exact keyphrase match in same category
    if (
      similarity > 0.55 ||
      (existing.category === candidate.category && similarity > 0.4)
    ) {
      matchToUpdate = existing;
      break;
    }
  }

  const now = Date.now();

  if (matchToUpdate) {
    // Update existing conflicting or duplicate memory
    const updatedItem: MemoryItem = {
      ...matchToUpdate,
      content: candidate.content,
      category: candidate.category,
      source: candidate.source || matchToUpdate.source,
      confidence: candidate.confidence,
      updatedAt: now,
      usageCount: matchToUpdate.usageCount + 1,
      isActive: true,
    };

    if (db && isBrowser) {
      try {
        const memDocRef = doc(db, 'users', userId, 'memories', matchToUpdate.id);
        await setDoc(memDocRef, cleanFirestoreData(updatedItem as unknown as Record<string, unknown>), { merge: true });
      } catch {
        // Fallback path
      }
    }

    let userMap = memoryFallbackStore.get(userId);
    if (!userMap) {
      userMap = new Map();
      memoryFallbackStore.set(userId, userMap);
    }
    userMap.set(matchToUpdate.id, updatedItem);

    return updatedItem;
  }

  // B. Capacity Limit Enforcement
  const activeCount = existingMemories.filter((m) => m.isActive).length;
  if (activeCount >= settings.maxActiveMemories) {
    // Deactivate the least recently used / oldest memory
    const oldest = [...existingMemories]
      .filter((m) => m.isActive)
      .sort((a, b) => (a.lastUsedAt || a.createdAt) - (b.lastUsedAt || b.createdAt))[0];

    if (oldest) {
      await toggleMemoryActive(userId, oldest.id, false);
    }
  }

  // C. Create New Memory
  const memoryId = `mem-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const newItem: MemoryItem = {
    id: memoryId,
    userId,
    category: candidate.category,
    content: candidate.content,
    source: candidate.source || 'conversation',
    confidence: candidate.confidence,
    createdAt: now,
    updatedAt: now,
    usageCount: 1,
    isActive: true,
    ...(conversationId ? { sourceConversationId: conversationId } : {}),
  };

  if (db && isBrowser) {
    try {
      const memDocRef = doc(db, 'users', userId, 'memories', memoryId);
      await setDoc(memDocRef, cleanFirestoreData(newItem as unknown as Record<string, unknown>));
    } catch {
      // Fallback path
    }
  }

  let userMap = memoryFallbackStore.get(userId);
  if (!userMap) {
    userMap = new Map();
    memoryFallbackStore.set(userId, userMap);
  }
  userMap.set(memoryId, newItem);

  return newItem;
}

/**
 * 5. Update an existing memory
 */
export async function updateMemory(
  userId: string,
  memoryId: string,
  updates: Partial<Pick<MemoryItem, 'content' | 'category' | 'isActive'>>
): Promise<MemoryItem | null> {
  if (!userId || !memoryId) return null;

  if (updates.content) {
    const safety = checkMemorySensitivity(updates.content);
    if (!safety.isSafe) return null;
  }

  const existingList = await getMemories(userId);
  const existing = existingList.find((m) => m.id === memoryId);
  if (!existing) return null;

  const updated: MemoryItem = {
    ...existing,
    ...updates,
    source: 'user_edited',
    updatedAt: Date.now(),
  };

  const userMap = memoryFallbackStore.get(userId);
  if (userMap) {
    userMap.set(memoryId, updated);
  }

  if (db && isBrowser) {
    try {
      const memDocRef = doc(db, 'users', userId, 'memories', memoryId);
      await updateDoc(memDocRef, cleanFirestoreData(updated as unknown as Record<string, unknown>));
    } catch {
      // Fallback path
    }
  }

  return updated;
}

/**
 * 6. Delete a single memory
 */
export async function deleteMemory(userId: string, memoryId: string): Promise<boolean> {
  if (!userId || !memoryId) return false;

  const userMap = memoryFallbackStore.get(userId);
  if (userMap) {
    userMap.delete(memoryId);
  }

  if (db && isBrowser) {
    try {
      const memDocRef = doc(db, 'users', userId, 'memories', memoryId);
      await deleteDoc(memDocRef);
    } catch {
      // Fallback path
    }
  }

  return true;
}

/**
 * 7. Delete all memories for a user
 */
export async function deleteAllMemories(userId: string): Promise<boolean> {
  if (!userId) return false;

  memoryFallbackStore.delete(userId);

  if (db && isBrowser) {
    try {
      const memoriesRef = collection(db, 'users', userId, 'memories');
      const snapshot = await getDocs(memoriesRef);
      const batch = writeBatch(db);

      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    } catch {
      // Fallback path
    }
  }

  return true;
}

/**
 * 8. Toggle individual memory active state
 */
export async function toggleMemoryActive(
  userId: string,
  memoryId: string,
  isActive: boolean
): Promise<boolean> {
  const result = await updateMemory(userId, memoryId, { isActive });
  return !!result;
}

/**
 * 9. Retrieve relevant memories for active prompt context
 * Filters by relevance so only pertinent memories are injected into Gemini prompt.
 */
export async function retrieveRelevantMemories(
  userId: string,
  currentQuery: string
): Promise<string[]> {
  if (!userId || !currentQuery || currentQuery.trim().length === 0) {
    return [];
  }

  const settings = await getMemorySettings(userId);
  if (!settings.isMemoryEnabled) {
    return [];
  }

  const activeMemories = await getMemories(userId, { activeOnly: true });
  if (activeMemories.length === 0) return [];

  const queryNormalized = normalizeForComparison(currentQuery);
  const queryTokens = new Set(queryNormalized.split(' ').filter((w) => w.length > 2));

  // Score relevance for each memory
  const scored = activeMemories.map((mem) => {
    const memTokens = normalizeForComparison(mem.content).split(' ');
    let matchCount = 0;

    for (const token of memTokens) {
      if (token.length > 2 && queryTokens.has(token)) {
        matchCount++;
      }
    }

    // Explicit standing instructions & general preferences get a slight baseline relevance
    const baseline = mem.category === 'instruction' || mem.category === 'preference' ? 0.3 : 0.0;
    const score = matchCount > 0 ? matchCount / memTokens.length + 0.5 : baseline;

    return {
      memory: mem,
      score,
    };
  });

  // Sort by score and take top 4 relevant memories
  const relevant = scored
    .filter((item) => item.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.memory.content);

  return relevant;
}
