import { NextRequest, NextResponse } from 'next/server';

// Mock API route for static theme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { message: 'Please provide all required fields.' },
        { status: 400 },
      );
    }

    // Return success (static theme - no actual signup)
    return NextResponse.json(
      { message: 'Account created successfully. Please check your email to verify your account.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
