import { NextRequest, NextResponse } from 'next/server';

// Mock API route for static theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { message: 'Invalid verification token.' },
        { status: 400 },
      );
    }

    // Return success (static theme)
    return NextResponse.json(
      { message: 'Email verified successfully.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
