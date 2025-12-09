import { NextRequest, NextResponse } from 'next/server';
import { mockRoles } from '@/lib/mock-data/roles';

// Mock API route for static theme
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';

  try {
    // Filter mock data
    let filteredRoles = [...mockRoles];

    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredRoles = filteredRoles.filter((role) =>
        role.name.toLowerCase().includes(lowerQuery),
      );
    }

    // Sort
    filteredRoles.sort((a, b) => {
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

    const total = filteredRoles.length;
    const isTableEmpty = total === 0;

    // Paginate
    const paginatedRoles = filteredRoles.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Format roles to match expected structure
    const formattedRoles = paginatedRoles.map((role) => ({
      ...role,
      permissions: role.permissions?.map((rp) => rp.permission) || [],
    }));

    return NextResponse.json({
      data: formattedRoles,
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
    const existingRole = mockRoles.find(
      (r) => r.slug === body.slug || r.name === body.name,
    );
    if (existingRole) {
      return NextResponse.json(
        { message: 'Name and slug must be unique' },
        { status: 400 },
      );
    }

    // Return success (static theme - no actual creation)
    const newRole = {
      id: String(mockRoles.length + 1),
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      isTrashed: false,
      isProtected: false,
      isDefault: false,
      createdAt: new Date(),
      permissions: [],
    };

    return NextResponse.json(newRole, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
