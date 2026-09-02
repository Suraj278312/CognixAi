/**
 * PDF Processing & Vector Embedding Route Handler — Cognix
 * Endpoint: POST /api/rag/process
 * Source of truth: docs/ai/RAG.md & ARCHITECTURE.md
 */

import { NextResponse } from 'next/server';
import { processPdfDocument } from '@/lib/rag/rag-service';
import { saveDocumentDoc, updateDocumentStatus } from '@/lib/firebase/firestore';
import { RAG_CONFIG } from '@/config/rag';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Google Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let userId = '';
    let documentId = '';
    let fileName = '';
    let fileBuffer: Buffer | null = null;
    let storagePath = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      userId = (formData.get('userId') as string) || '';
      documentId = (formData.get('documentId') as string) || '';
      storagePath = (formData.get('storagePath') as string) || '';

      if (!file) {
        return NextResponse.json(
          { error: 'No PDF file was provided in the upload request.' },
          { status: 400 }
        );
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      userId = body.userId;
      documentId = body.documentId;
      fileName = body.fileName;
      storagePath = body.storagePath || '';

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, 'base64');
      }
    }

    if (!userId || !documentId || !fileName || !fileBuffer) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, documentId, fileName, or file data.' },
        { status: 400 }
      );
    }

    // Size validation
    if (fileBuffer.length > RAG_CONFIG.maxPdfSizeBytes) {
      return NextResponse.json(
        {
          error: `File size exceeds the maximum limit of ${RAG_CONFIG.maxPdfSizeMb}MB.`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // Mark document status as 'processing'
    await updateDocumentStatus(userId, documentId, 'processing', {
      fileName,
      fileSizeBytes: fileBuffer.length,
      mimeType: 'application/pdf',
      storagePath: storagePath || `users/${userId}/documents/${documentId}/${fileName}`,
    }).catch(() => {
      // If doc does not exist yet, create it
      return saveDocumentDoc(userId, {
        id: documentId,
        userId,
        fileName,
        fileSizeBytes: fileBuffer.length,
        mimeType: 'application/pdf',
        storagePath: storagePath || `users/${userId}/documents/${documentId}/${fileName}`,
        status: 'processing',
        createdAt: Date.now(),
      });
    });

    // Execute end-to-end RAG processing (Parse -> Chunk -> Embed -> Save)
    const result = await processPdfDocument(
      userId,
      documentId,
      fileName,
      fileBuffer,
      apiKey
    );

    // Update document status as 'ready'
    await updateDocumentStatus(userId, documentId, 'ready', {
      pageCount: result.pageCount,
      chunkCount: result.chunkCount,
      errorMessage: undefined,
    });

    return NextResponse.json({
      success: true,
      documentId,
      fileName,
      pageCount: result.pageCount,
      chunkCount: result.chunkCount,
      status: 'ready',
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('PDF Processing Error:', errorMsg);

    return NextResponse.json(
      {
        error: errorMsg,
        code: 'PROCESSING_FAILED',
      },
      { status: 500 }
    );
  }
}
