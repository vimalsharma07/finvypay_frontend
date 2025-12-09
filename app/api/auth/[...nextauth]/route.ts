import { NextRequest, NextResponse } from 'next/server';

// Mock NextAuth route for static theme - just return 404 or mock response
export async function GET(request: NextRequest) {
  // Static theme - no authentication needed
  return NextResponse.json(
    { message: 'Authentication not available in static theme mode.' },
    { status: 404 },
  );
}

export async function POST(request: NextRequest) {
  // Static theme - no authentication needed
  return NextResponse.json(
    { message: 'Authentication not available in static theme mode.' },
    { status: 404 },
  );
}
