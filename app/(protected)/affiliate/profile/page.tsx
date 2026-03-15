'use client';

import { useEffect, useState, useMemo } from 'react';
import { User, Loader2, Mail } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getAffiliateProfile, type AffiliateProfile } from '@/lib/services/affiliate/profile';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import { modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { toast } from 'sonner';

const labelClass = 'block text-sm font-medium text-muted-foreground';
const valueClass = 'mt-0.5 text-sm font-medium text-foreground';

function kycStatusBadge(status: string | null | undefined) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const n = String(status).toLowerCase();
  if (n === 'approved' || n === 'active')
    return <Badge variant="success">{status}</Badge>;
  if (n === 'pending') return <Badge variant="warning">{status}</Badge>;
  if (n === 'rejected' || n === 'failed')
    return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function formatDate(v: string | null | undefined) {
  if (v == null) return '—';
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return String(v);
  }
}

/**
 * Affiliate Profile Page
 * Displays current affiliate user profile from GET /affiliate/profile.
 */
export default function AffiliateProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getAffiliateProfile();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.success && data.data) {
              setProfile(data.data);
            } else {
              setProfile(null);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load profile');
            setProfile(null);
          },
        });
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayUser = useMemo(() => {
    if (profile) return profile;
    return (user ?? {}) as Partial<AffiliateProfile>;
  }, [profile, user]);

  const initials = useMemo(() => {
    const source = displayUser?.name || displayUser?.email || '';
    const parts = String(source).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(source).slice(0, 1).toUpperCase() || 'A';
  }, [displayUser]);

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Profile"
            description="Your affiliate account details"
            icon={User}
          />
        </Toolbar>
      </Container>
      <Container>
        {loading ? (
          <Card className={modernTableCardClasses.card}>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 mt-5 lg:mt-7.5">
            {/* Profile summary card */}
            <Card className={modernTableCardClasses.card}>
              <CardHeader
                className={`${modernTableCardClasses.header} flex flex-col items-start gap-4`}
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initials}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {String(displayUser?.name ?? 'Affiliate')}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-0.5 text-sm">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">
                      {String(displayUser?.email ?? '—')}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayUser?.role != null && (
                    <Badge variant="secondary" className="capitalize">
                      {String(displayUser.role)}
                    </Badge>
                  )}
                  {displayUser?.kycStatus != null &&
                    kycStatusBadge(displayUser.kycStatus)}
                  {displayUser?.isBlocked != null && (
                    <Badge
                      variant={displayUser.isBlocked ? 'destructive' : 'success'}
                    >
                      {displayUser.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Basic details card */}
            <Card className={`${modernTableCardClasses.card} lg:col-span-2`}>
              <CardHeader className={modernTableCardClasses.header}>
                <div className="space-y-1">
                  <CardTitle>Basic Details</CardTitle>
                  <CardDescription className="mt-1">
                    Your affiliate account information
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className={labelClass}>Name</span>
                    <p className={valueClass}>
                      {displayUser?.name != null ? String(displayUser.name) : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>Email</span>
                    <p className={valueClass}>
                      {displayUser?.email != null
                        ? String(displayUser.email)
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>Role</span>
                    <p className={valueClass}>
                      {displayUser?.role != null
                        ? String(displayUser.role)
                        : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>KYC Status</span>
                    <div className="mt-0.5">
                      {kycStatusBadge(displayUser?.kycStatus)}
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className={labelClass}>Unique ID</span>
                    <p
                      className={`${valueClass} break-all font-mono text-xs`}
                      title={displayUser?.uniqueId ?? undefined}
                    >
                      {displayUser?.uniqueId ??
                        displayUser?.id ??
                        '—'}
                    </p>
                  </div>
                  {displayUser?.emailVerifiedAt != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>Email verified at</span>
                      <p className={valueClass}>
                        {formatDate(displayUser.emailVerifiedAt)}
                      </p>
                    </div>
                  )}
                  {displayUser?.createdAt != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>Created at</span>
                      <p className={valueClass}>
                        {formatDate(displayUser.createdAt)}
                      </p>
                    </div>
                  )}
                  {displayUser?.updatedAt != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>Updated at</span>
                      <p className={valueClass}>
                        {formatDate(displayUser.updatedAt)}
                      </p>
                    </div>
                  )}
                  {profile?.provider != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>Provider</span>
                      <p className={valueClass}>{String(profile.provider)}</p>
                    </div>
                  )}
                  {profile?.isTwoFaEnabled != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>Two-factor auth</span>
                      <p className={valueClass}>
                        {profile.isTwoFaEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  )}
                  {profile?.ipEnabled != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>IP allowlist</span>
                      <p className={valueClass}>
                        {profile.ipEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  )}
                  {profile?.binEnabled != null && (
                    <div className="space-y-1">
                      <span className={labelClass}>BIN enablement</span>
                      <p className={valueClass}>
                        {profile.binEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </>
  );
}
