// Mock role data for static theme
export interface MockRole {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isTrashed: boolean;
  isProtected: boolean;
  isDefault: boolean;
  createdAt: Date;
  permissions?: MockRolePermission[];
}

export interface MockRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedAt: Date;
  permission: {
    id: string;
    name: string;
    slug: string;
  };
}

export const mockRoles: MockRole[] = [
  {
    id: '1',
    slug: 'administrator',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isTrashed: false,
    isProtected: true,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
    permissions: [
      {
        id: '1',
        roleId: '1',
        permissionId: '1',
        assignedAt: new Date('2024-01-01'),
        permission: {
          id: '1',
          name: 'Manage Users',
          slug: 'manage-users',
        },
      },
      {
        id: '2',
        roleId: '1',
        permissionId: '2',
        assignedAt: new Date('2024-01-01'),
        permission: {
          id: '2',
          name: 'Manage Roles',
          slug: 'manage-roles',
        },
      },
    ],
  },
  {
    id: '2',
    slug: 'manager',
    name: 'Manager',
    description: 'Can manage team members and view reports',
    isTrashed: false,
    isProtected: false,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
    permissions: [
      {
        id: '3',
        roleId: '2',
        permissionId: '3',
        assignedAt: new Date('2024-01-01'),
        permission: {
          id: '3',
          name: 'View Reports',
          slug: 'view-reports',
        },
      },
    ],
  },
  {
    id: '3',
    slug: 'user',
    name: 'User',
    description: 'Standard merchant with basic access',
    isTrashed: false,
    isProtected: false,
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    permissions: [],
  },
];

