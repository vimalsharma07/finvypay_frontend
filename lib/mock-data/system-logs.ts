// Mock system log data for static theme
export interface MockSystemLog {
  id: string;
  userId: string;
  createdAt: Date;
  entityId?: string | null;
  entityType?: string | null;
  event?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const mockSystemLogs: MockSystemLog[] = [
  {
    id: '1',
    userId: '1',
    createdAt: new Date('2024-01-20T10:30:00'),
    entityId: '2',
    entityType: 'user',
    event: 'create',
    description: 'User added by user.',
    ipAddress: '192.168.1.100',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
  {
    id: '2',
    userId: '1',
    createdAt: new Date('2024-01-20T09:15:00'),
    entityId: '3',
    entityType: 'role',
    event: 'update',
    description: 'Role updated by user.',
    ipAddress: '192.168.1.100',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
  {
    id: '3',
    userId: '2',
    createdAt: new Date('2024-01-19T14:20:00'),
    entityId: '4',
    entityType: 'user',
    event: 'delete',
    description: 'User deleted by user.',
    ipAddress: '192.168.1.101',
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
  {
    id: '4',
    userId: '1',
    createdAt: new Date('2024-01-19T11:45:00'),
    entityId: '1',
    entityType: 'settings',
    event: 'update',
    description: 'System settings updated.',
    ipAddress: '192.168.1.100',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
  {
    id: '5',
    userId: '2',
    createdAt: new Date('2024-01-18T16:30:00'),
    entityId: '5',
    entityType: 'permission',
    event: 'create',
    description: 'Permission created by user.',
    ipAddress: '192.168.1.101',
    user: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
];

