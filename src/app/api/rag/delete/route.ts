/**
 * Document Deletion & Vector Cleanup Route Handler — Cognix
 * Endpoint: POST /api/rag/delete
 * Source of truth: docs/ai/RAG.md
 */

import { NextResponse } from 'next/server';
import { deleteDocumentDoc } from '@/lib/firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, documentId } = await req.json();

    if (!userId || !documentId) {
      return NextResponse.json(
        { error: 'userId and documentId are required.' },
        { status: 400 }
      );
    }

    // Delete document document and all its chunks subcollection from Firestore
    await deleteDocumentDoc(userId, documentId);

    return NextResponse.json({
      success: true,
      documentId,
      message: 'Document and associated vector chunks successfully deleted.',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
