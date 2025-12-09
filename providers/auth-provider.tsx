'use client';

// Mock auth provider for static theme - no authentication needed
interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Static theme - just render children without auth
  return <>{children}</>;
}
