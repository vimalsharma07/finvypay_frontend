import { NextRequest, NextResponse } from 'next/server';

// Mock API route for static theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'Invalid input. Please provide an array of IDs.' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Permissions successfully deleted.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
