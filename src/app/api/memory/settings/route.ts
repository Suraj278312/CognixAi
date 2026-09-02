import { NextResponse } from 'next/server';
import { getMemorySettings, updateMemorySettings } from '@/lib/memory/memory-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/memory/settings?userId=...
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

    const settings = await getMemorySettings(userId);
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch memory settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/memory/settings
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, isMemoryEnabled, maxActiveMemories, confidenceThreshold } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const updated = await updateMemorySettings(userId, {
      isMemoryEnabled,
      maxActiveMemories,
      confidenceThreshold,
    });

    return NextResponse.json({ settings: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update memory settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
