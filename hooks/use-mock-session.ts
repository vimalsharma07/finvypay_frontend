// Mock session hook for static theme
import { mockUsers } from '@/lib/mock-data/users';

export function useMockSession() {
  // Return first user as mock session
  const mockUser = mockUsers[0];

  return {
    data: {
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatar: mockUser.avatar,
        roleId: mockUser.roleId,
        roleName: mockUser.role.name,
        status: mockUser.status,
      },
    },
    status: 'authenticated' as const,
  };
}

export function mockSignOut() {
  // Mock sign out - just log for static theme
  console.log('Mock sign out - static theme mode');
  if (typeof window !== 'undefined') {
    // Could redirect to signin page if needed
    // window.location.href = '/signin';
  }
}

