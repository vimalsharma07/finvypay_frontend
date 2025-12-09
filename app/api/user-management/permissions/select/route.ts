import { NextResponse } from 'next/server';
import { mockPermissions } from '@/lib/mock-data/permissions';

// Mock API route for static theme
export async function GET() {
  try {
    // Format permissions for select dropdown
    const permissions = mockPermissions
      .map((permission) => ({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(permissions);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
