// Mock user data for static theme
export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  country?: string | null;
  timezone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date | null;
  emailVerifiedAt?: Date | null;
  isTrashed: boolean;
  isProtected: boolean;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/media/avatars/300-1.jpg',
    status: 'ACTIVE',
    roleId: '1',
    role: {
      id: '1',
      name: 'Administrator',
    },
    country: 'US',
    timezone: 'America/New_York',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastSignInAt: new Date('2024-01-20'),
    emailVerifiedAt: new Date('2024-01-15'),
    isTrashed: false,
    isProtected: true,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: '/media/avatars/300-2.jpg',
    status: 'ACTIVE',
    roleId: '2',
    role: {
      id: '2',
      name: 'Manager',
    },
    country: 'UK',
    timezone: 'Europe/London',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-19'),
    lastSignInAt: new Date('2024-01-19'),
    emailVerifiedAt: new Date('2024-01-16'),
    isTrashed: false,
    isProtected: false,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: '/media/avatars/300-3.jpg',
    status: 'ACTIVE',
    roleId: '3',
    role: {
      id: '3',
      name: 'User',
    },
    country: 'CA',
    timezone: 'America/Toronto',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    lastSignInAt: new Date('2024-01-18'),
    emailVerifiedAt: new Date('2024-01-17'),
    isTrashed: false,
    isProtected: false,
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    avatar: '/media/avatars/300-4.jpg',
    status: 'INACTIVE',
    roleId: '3',
    role: {
      id: '3',
      name: 'User',
    },
    country: 'AU',
    timezone: 'Australia/Sydney',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    lastSignInAt: null,
    emailVerifiedAt: null,
    isTrashed: false,
    isProtected: false,
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatar: '/media/avatars/300-5.jpg',
    status: 'BLOCKED',
    roleId: '3',
    role: {
      id: '3',
      name: 'User',
    },
    country: 'US',
    timezone: 'America/Los_Angeles',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    lastSignInAt: new Date('2024-01-12'),
    emailVerifiedAt: new Date('2024-01-05'),
    isTrashed: false,
    isProtected: false,
  },
];

