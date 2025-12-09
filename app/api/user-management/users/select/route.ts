import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users';

// Mock API route for static theme
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  try {
    // Filter mock data
    let filteredUsers = [...mockUsers];

    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowerQuery) ||
          user.email?.toLowerCase().includes(lowerQuery),
      );
    }

    // Format response
    const formattedUsers = filteredUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      createdAt: user.createdAt,
    }));

    // Sort by name
    formattedUsers.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    return NextResponse.json(formattedUsers);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
