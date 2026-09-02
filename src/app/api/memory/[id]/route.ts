import { NextResponse } from 'next/server';
import { updateMemory, deleteMemory } from '@/lib/memory/memory-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/memory/[id]
 * Update a specific memory item.
 */
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const memoryId = context.params.id;
    const body = await req.json();
    const { userId, content, category, isActive } = body;

    if (!userId || !memoryId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and memory id' },
        { status: 400 }
      );
    }

    const updated = await updateMemory(userId, memoryId, {
      content: content ? content.trim() : undefined,
      category,
      isActive,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Memory not found or update rejected by security policy' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memory: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update memory';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/memory/[id]?userId=...
 * Delete a specific memory item.
 */
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const memoryId = context.params.id;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !memoryId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and memory id' },
        { status: 400 }
      );
    }

    const success = await deleteMemory(userId, memoryId);
    return NextResponse.json({ success, id: memoryId });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete memory';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
