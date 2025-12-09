import { NextResponse } from 'next/server';
import { mockSettings } from '@/lib/mock-data/settings';
import { mockRoles } from '@/lib/mock-data/roles';

// Mock API route for static theme
export async function GET() {
  try {
    // Return mock settings and roles
    const roles = mockRoles.map((role) => ({
      id: role.id,
      name: role.name,
    }));

    return NextResponse.json({ settings: mockSettings, roles });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
