import { NextRequest, NextResponse } from 'next/server';
import { mockRoles } from '@/lib/mock-data/roles';

// Mock API route for static theme
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const role = mockRoles.find((r) => r.id === id);

    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    // Format permissions
    const permissions = role.permissions?.map((rp) => rp.permission) || [];

    return NextResponse.json({ ...role, permissions });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// Mock PUT - just returns success
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id || !body.name || !body.slug) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const role = mockRoles.find((r) => r.id === id);
    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Role successfully updated.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// Mock DELETE - just returns success
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const role = mockRoles.find((r) => r.id === id);
    if (role && role.isProtected) {
      return NextResponse.json(
        { message: 'You do not have permission to delete system roles.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: 'Role successfully deleted.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
