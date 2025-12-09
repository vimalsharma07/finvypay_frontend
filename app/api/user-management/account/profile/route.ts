import { NextRequest, NextResponse } from 'next/server';

// Mock API route for static theme
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { message: 'Invalid input.' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Profile successfully updated.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
