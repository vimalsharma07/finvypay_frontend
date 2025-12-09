import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users';
import { mockRoles } from '@/lib/mock-data/roles';

// Mock API route for static theme
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Find user in mock data
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    // Find role
    const role = mockRoles.find((r) => r.id === user.roleId);

    return NextResponse.json({
      ...user,
      role: role || user.role,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// Mock PUT - just returns success message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate basic structure
    if (!id || !body.name || !body.status || !body.roleId) {
      return NextResponse.json(
        { message: 'Invalid input.' },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 },
      );
    }

    // Check if role exists
    const roleExists = mockRoles.find((r) => r.id === body.roleId);
    if (!roleExists) {
      return NextResponse.json(
        { message: 'Role does not exist' },
        { status: 400 },
      );
    }

    // Return success (static theme - no actual update)
    return NextResponse.json(
      { message: 'User profile successfully updated.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// Mock DELETE - just returns success message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 },
      );
    }

    // Check if user exists and is protected
    const user = mockUsers.find((u) => u.id === id);
    if (user && user.isProtected) {
      return NextResponse.json(
        { message: 'You do not have permission to delete system users.' },
        { status: 401 },
      );
    }

    // Return success (static theme - no actual deletion)
    return NextResponse.json(
      { message: 'User successfully deleted.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
