import { NextRequest, NextResponse } from 'next/server';

// Mock API route for static theme
export async function POST(request: NextRequest) {
  try {
    // Just return success - static theme doesn't actually save
    return NextResponse.json(
      { message: 'Settings updated successfully' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
