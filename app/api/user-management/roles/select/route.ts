import { NextResponse } from 'next/server';
import { mockRoles } from '@/lib/mock-data/roles';

// Mock API route for static theme
export async function GET() {
  try {
    // Format roles for select dropdown
    const roles = mockRoles
      .map((role) => ({
        id: role.id,
        name: role.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(roles);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
