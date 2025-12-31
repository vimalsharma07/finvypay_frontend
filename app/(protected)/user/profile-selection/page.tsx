'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

function resolveFullUser(user: any) {
  if (user?.merchantProfiles || user?.industry) return user;
  if (typeof window === 'undefined') return user;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : user;
  } catch {
    return user;
  }
}

export default function UserProfileSelectionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const fullUser = useMemo(() => resolveFullUser(user), [user]);

  const primaryProfile = useMemo(() => {
    const profiles = fullUser?.merchantProfiles;
    if (profiles?.length) {
      return profiles.find((p: any) => p?.isPrimary) ?? profiles[0];
    }
    return null;
  }, [fullUser]);

  const profileName =
    primaryProfile?.industry?.name ||
    fullUser?.industry?.name ||
    'Profile';

  const profileInitial = profileName?.[0]?.toUpperCase() || 'P';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">What&apos;s your primary profile?</h1>
        <p className="text-muted-foreground">Confirm your primary business profile to continue.</p>
      </div>

      <Card className="w-40 h-48 flex flex-col items-center justify-center gap-3 border-primary/20 bg-primary/5">
        <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
          {profileInitial}
        </div>
        <div className="text-sm font-medium">{profileName}</div>
      </Card>

      <div className="space-y-3">
        <Button size="lg" onClick={() => router.push('/user/dashboard')}>
          Continue
        </Button>
        <div className="text-xs text-muted-foreground">
          Need to change profile? Manage profiles from your account settings.
        </div>
      </div>
    </div>
  );
}

