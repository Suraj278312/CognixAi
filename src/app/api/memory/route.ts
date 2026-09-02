import { NextResponse } from 'next/server';
import {
  getMemories,
  saveMemory,
  deleteAllMemories,
} from '@/lib/memory/memory-service';
import type { MemoryCandidate } from '@/types/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/memory?userId=...
 * Fetch all memories for the authenticated user.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const memories = await getMemories(userId);
    return NextResponse.json({ memories });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch memories';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/memory
 * Explicitly create a new memory item.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, category, content, confidence, source, conversationId } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and content are required' },
        { status: 400 }
      );
    }

    const candidate: MemoryCandidate = {
      category: category || 'preference',
      content: content.trim(),
      confidence: typeof confidence === 'number' ? confidence : 1.0,
      source: source || 'explicit',
    };

    const saved = await saveMemory(userId, candidate, conversationId);

    if (!saved) {
      return NextResponse.json(
        { error: 'Memory could not be saved (rejected by sensitive filter or disabled in settings)' },
        { status: 422 }
      );
    }

    return NextResponse.json({ memory: saved }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create memory';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/memory
 * Delete all memories for the authenticated user.
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, confirm } = body;

    if (!userId || confirm !== true) {
      return NextResponse.json(
        { error: 'Confirmation required to delete all memories' },
        { status: 400 }
      );
    }

    const success = await deleteAllMemories(userId);
    return NextResponse.json({ success, message: 'All memories deleted permanently.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete memories';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
