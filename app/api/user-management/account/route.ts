import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users';

// Mock API route for static theme - returns first user as current user
export async function GET() {
  try {
    // Return first user as mock current user
    const currentUser = mockUsers[0];

    return NextResponse.json({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
      role: currentUser.role,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
