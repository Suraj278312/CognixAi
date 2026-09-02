import { NextResponse } from 'next/server';
import {
  extractMemoryCandidates,
  detectForgetIntent,
} from '@/lib/memory/memory-extractor';
import {
  saveMemory,
  getMemories,
  deleteMemory,
  getMemorySettings,
} from '@/lib/memory/memory-service';
import type { MemoryItem } from '@/types/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/memory/extract
 * Background non-blocking extraction called after conversation turn completion.
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await req.json();
    const { userId, userMessage, assistantResponse, conversationId } = body;

    if (!userId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and userMessage' },
        { status: 400 }
      );
    }

    // 1. Check if memory recording is enabled
    const settings = await getMemorySettings(userId);
    if (!settings.isMemoryEnabled) {
      return NextResponse.json({ extracted: [], saved: [], status: 'memory_disabled' });
    }

    // 2. Check for natural-language forget intent
    const forget = detectForgetIntent(userMessage);
    if (forget.isForget) {
      if (forget.topic) {
        const topic = forget.topic.toLowerCase();
        const existingMemories = await getMemories(userId);
        const matches = existingMemories.filter((m) =>
          m.content.toLowerCase().includes(topic)
        );

        for (const match of matches) {
          await deleteMemory(userId, match.id);
        }

        return NextResponse.json({
          status: 'forgot',
          deletedCount: matches.length,
          topic: forget.topic,
        });
      }
    }

    // 3. Extract candidate memories via Gemini
    const candidates = await extractMemoryCandidates(
      { userMessage, assistantResponse },
      apiKey
    );

    if (candidates.length === 0) {
      return NextResponse.json({ extracted: [], saved: [] });
    }

    // 4. Save candidates with conflict resolution & deduplication
    const savedItems: MemoryItem[] = [];

    for (const cand of candidates) {
      const saved = await saveMemory(userId, cand, conversationId);
      if (saved) {
        savedItems.push(saved);
      }
    }

    return NextResponse.json({
      extracted: candidates,
      saved: savedItems,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Memory extraction failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
