'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import {
  getMerchantProfiles,
  setPrimaryMerchantProfile,
  type MerchantProfileListResponse,
} from '@/lib/services/user/merchant-profile';
import { toast } from 'sonner';

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
  const [profilesFromApi, setProfilesFromApi] = useState<Array<any>>([]);
  const [switchingProfileId, setSwitchingProfileId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const resp = await getMerchantProfiles();
        if (resp.status === 200) {
          const payload = resp.data as MerchantProfileListResponse | undefined;
          if (payload?.success && Array.isArray(payload.data)) {
            setProfilesFromApi(payload.data);
          }
        }
      } catch {
        // ignore and fall back to user data
      }
    };

    loadProfiles();
  }, []);

  const handleSwitchProfile = async (profile: any) => {
    const id = profile?.id;
    if (!id) return;
    if (profile.isPrimary) {
      // Already primary, nothing to do
      return;
    }
    try {
      setSwitchingProfileId(String(id));
      const resp = await setPrimaryMerchantProfile(id);
      if (resp.status !== 200 || resp.error) {
        toast.error(resp.error || 'Failed to switch profile');
        return;
      }
      toast.success('Profile switched successfully');
      // Refetch profiles to refresh primary state and sync local user cache
      const refreshed = await getMerchantProfiles();
      if (refreshed.status === 200) {
        const payload = refreshed.data as MerchantProfileListResponse | undefined;
        if (payload?.success && Array.isArray(payload.data)) {
          const updatedProfiles = payload.data;
          setProfilesFromApi(updatedProfiles);

          // Update localStorage user.merchantProfiles so getUserProfileId sees the new primary
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('user');
              if (raw) {
                const parsed = JSON.parse(raw);
                parsed.merchantProfiles = updatedProfiles;
                localStorage.setItem('user', JSON.stringify(parsed));
              }
            } catch {
              // ignore sync errors
            }
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to switch profile',
      );
    } finally {
      setSwitchingProfileId(null);
    }
  };

  const primaryFromApi = useMemo(() => {
    if (!profilesFromApi.length) return null;
    return profilesFromApi.find((p) => p.isPrimary) ?? profilesFromApi[0];
  }, [profilesFromApi]);

  const fallbackPrimaryProfile = useMemo(() => {
    const profiles = fullUser?.merchantProfiles;
    if (profiles?.length) {
      return profiles.find((p: any) => p?.isPrimary) ?? profiles[0];
    }
    return null;
  }, [fullUser]);

  const primaryNameFromApi =
    (primaryFromApi as any)?.industryName || primaryFromApi?.merchantProfileName;

  const fallbackProfileName =
    fallbackPrimaryProfile?.industry?.name ||
    fullUser?.industry?.name ||
    'Profile';

  const profileName = primaryNameFromApi || fallbackProfileName;
  const profileInitial = profileName?.[0]?.toUpperCase() || 'P';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">What&apos;s your primary profile?</h1>
        <p className="text-muted-foreground">Confirm your primary business profile to continue.</p>
      </div>

      {profilesFromApi.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {profilesFromApi.map((profile: any) => {
            const name = profile.industryName || profile.merchantProfileName || 'Profile';
            const initial = name?.[0]?.toUpperCase() || 'P';
            return (
              <Card
                key={profile.id}
                onClick={() => handleSwitchProfile(profile)}
                className={`w-40 h-48 flex flex-col items-center justify-center gap-3 border-primary/20 cursor-pointer transition-transform hover:-translate-y-0.5 ${
                  profile.isPrimary ? 'bg-primary/5' : 'bg-muted/10'
                }`}
              >
                <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
                  {initial}
                </div>
                <div className="text-sm font-medium">
                  {name}
                  {switchingProfileId === String(profile.id) && ' · Updating...'}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="w-40 h-48 flex flex-col items-center justify-center gap-3 border-primary/20 bg-primary/5">
          <div className="w-24 h-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
            {profileInitial}
          </div>
          <div className="text-sm font-medium">{profileName}</div>
        </Card>
      )}

      <div className="space-y-3">
        <Button size="lg" onClick={() => router.push('/dashboard')}>
          Continue
        </Button>
        <div className="text-xs text-muted-foreground">
          Need to change profile? Manage profiles from your account settings.
        </div>
      </div>
    </div>
  );
}
