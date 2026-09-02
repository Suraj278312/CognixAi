/**
 * Memory Taxonomy, Data Models & Interfaces — Cognix Phase 6
 * Source of truth: docs/ai/MEMORY.md
 */

export type MemoryCategory =
  | 'profile'       // Name, occupation, role, background
  | 'preference'    // Formatting, tone, language, UI style
  | 'goal'          // Learning objectives, career targets
  | 'project'       // Active codebases, applications being built
  | 'instruction'   // Standing rules ("always use TypeScript", "prefer Tailwind")
  | 'skill'         // Programming languages, domains of expertise
  | 'interest'      // Technical topics, AI research areas
  | 'context';      // Persistent environment details (e.g. Mac/Windows, Next.js)

export type MemorySource = 'explicit' | 'conversation' | 'user_edited';

export interface MemoryItem {
  id: string;
  userId: string;
  category: MemoryCategory;
  content: string;
  source: MemorySource;
  confidence: number;      // 0.0 to 1.0 (default confidence threshold: 0.7)
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  usageCount: number;
  isActive: boolean;       // Enable/disable individual memory
  sourceConversationId?: string;
  expiresAt?: number;      // Optional future expiration timestamp
}

export interface MemoryCandidate {
  category: MemoryCategory;
  content: string;
  confidence: number;
  source?: MemorySource;
}

export interface MemorySettings {
  isMemoryEnabled: boolean;
  maxActiveMemories: number;    // default: 50
  confidenceThreshold: number;  // default: 0.7
}
