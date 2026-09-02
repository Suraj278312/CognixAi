import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Cognix AI Assistant',
    version: '1.0.0',
    phase: 'Phase 1: Premium Web App & Design System',
  });
}
