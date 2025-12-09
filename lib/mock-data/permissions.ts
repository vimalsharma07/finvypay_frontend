// Mock permission data for static theme
export interface MockPermission {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  createdAt: Date;
}

export const mockPermissions: MockPermission[] = [
  {
    id: '1',
    slug: 'manage-users',
    name: 'Manage Users',
    description: 'Create, edit, and delete users',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    slug: 'manage-roles',
    name: 'Manage Roles',
    description: 'Create, edit, and delete roles',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    slug: 'view-reports',
    name: 'View Reports',
    description: 'Access to view system reports',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    slug: 'manage-settings',
    name: 'Manage Settings',
    description: 'Modify system settings',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    slug: 'view-logs',
    name: 'View Logs',
    description: 'View system activity logs',
    createdAt: new Date('2024-01-01'),
  },
];

