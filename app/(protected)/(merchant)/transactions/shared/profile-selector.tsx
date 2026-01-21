'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getMerchantProfiles, MerchantProfile } from '@/lib/services/user/merchant-profile';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileSelectorProps {
  value?: number | null;
  onChange: (profileId: number | null) => void;
  className?: string;
}

export function ProfileSelector({ value, onChange, className }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<MerchantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMerchantProfiles();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              const profileList = Array.isArray(data.data) ? data.data : [];
              setProfiles(profileList);
              
              // If no value is set and we have profiles, default to primary
              if (!value && profileList.length > 0) {
                const primaryProfile = profileList.find((p: MerchantProfile) => p.isPrimary);
                if (primaryProfile) {
                  onChange(primaryProfile.id);
                } else if (profileList.length > 0) {
                  // If no primary, use first profile
                  onChange(profileList[0].id);
                }
              }
            }
          },
          onError: (errorMessage) => {
            setError(errorMessage || 'Failed to load merchant profiles');
            toast.error(errorMessage || 'Failed to load merchant profiles');
          },
        });
      } catch (error) {
        const errorMessage = 'An unexpected error occurred while loading profiles';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [value, onChange]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading profiles...</span>
      </div>
    );
  }

  if (error || profiles.length === 0) {
    return (
      <div className={`text-sm text-destructive ${className}`}>
        {error || 'No merchant profiles found. Please complete onboarding first.'}
      </div>
    );
  }

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(val) => onChange(val ? parseInt(val, 10) : null)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select merchant profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={String(profile.id)}>
            <div className="flex items-center gap-1">
              <span>{profile.merchantProfileName}</span>
              {profile.isPrimary && (
                <Badge variant="secondary" className="text-xs">
                  Primary
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

