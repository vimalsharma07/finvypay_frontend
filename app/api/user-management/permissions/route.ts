import { NextRequest, NextResponse } from 'next/server';
import { mockPermissions } from '@/lib/mock-data/permissions';

// Mock API route for static theme
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const roleId = searchParams.get('roleId') || null;

  try {
    // Filter mock data
    let filteredPermissions = [...mockPermissions];

    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredPermissions = filteredPermissions.filter(
        (permission) =>
          permission.name.toLowerCase().includes(lowerQuery) ||
          permission.slug.toLowerCase().includes(lowerQuery),
      );
    }

    // Filter by roleId if provided (mock - just return all for now)
    // In a real scenario, you'd filter based on role-permission relationships

    // Sort
    filteredPermissions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (sortDirection === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    const total = filteredPermissions.length;
    const isTableEmpty = total === 0;

    // Paginate
    const paginatedPermissions = filteredPermissions.slice(
      (page - 1) * limit,
      page * limit,
    );

    return NextResponse.json({
      data: paginatedPermissions,
      pagination: {
        total,
        page,
      },
      empty: isTableEmpty,
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
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    // Check for uniqueness (mock check)
    const existingPermission = mockPermissions.find(
      (p) => p.slug === body.slug || p.name === body.name,
    );
    if (existingPermission) {
      return NextResponse.json(
        { message: 'Name must be unique' },
        { status: 400 },
      );
    }

    // Return success (static theme - no actual creation)
    const newPermission = {
      id: String(mockPermissions.length + 1),
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      createdAt: new Date(),
    };

    return NextResponse.json(newPermission, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
