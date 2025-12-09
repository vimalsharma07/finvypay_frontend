import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data/users';

// Mock API route for static theme
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const status = searchParams.get('status') || null;
  const roleId = searchParams.get('roleId') || null;

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

    // Apply status filter
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter((user) => user.status === status);
    }

    // Apply role filter
    if (roleId && roleId !== 'all') {
      filteredUsers = filteredUsers.filter((user) => user.roleId === roleId);
    }

    // Sort
    filteredUsers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'role_name':
          aValue = a.role.name || '';
          bValue = b.role.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'lastSignInAt':
          aValue = a.lastSignInAt?.getTime() || 0;
          bValue = b.lastSignInAt?.getTime() || 0;
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortDirection === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    const totalCount = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Format response to match expected structure
    const formattedUsers = paginatedUsers.map((user) => ({
      id: user.id,
      isTrashed: user.isTrashed,
      avatar: user.avatar,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    }));

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// Mock POST - just returns success message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate basic structure
    if (!body.name || !body.email || !body.roleId) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 },
      );
    }

    // Check if email already exists (mock check)
    const existingUser = mockUsers.find((u) => u.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered.' },
        { status: 409 },
      );
    }

    // Return success (static theme - no actual creation)
    return NextResponse.json(
      {
        message: 'User successfully added.',
        user: {
          id: String(mockUsers.length + 1),
          name: body.name,
          email: body.email,
          roleId: body.roleId,
          status: 'ACTIVE',
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
