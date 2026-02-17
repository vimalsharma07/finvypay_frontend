'use client';

import { useEffect, useState, useMemo } from 'react';
import { User, Loader2, Mail } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getProfile } from '@/lib/services/auth';
import { Badge } from '@/components/ui/badge';
import { modernTableCardClasses } from '@/app/(protected)/components/table-comp';

const labelClass = 'block text-sm font-medium text-muted-foreground';
const valueClass = 'mt-0.5 text-sm font-medium text-foreground';

function kycStatusBadge(status: string | null | undefined) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const n = status.toLowerCase();
  if (n === 'approved' || n === 'active') return <Badge variant="success">{status}</Badge>;
  if (n === 'pending') return <Badge variant="warning">{status}</Badge>;
  if (n === 'rejected' || n === 'failed') return <Badge variant="destructive">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

/**
 * Admin Profile Page
 * Basic details only; no Two-Factor Authentication section.
 */
export default function AdminProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getProfile();
        if (response.status === 200 && response.data) {
          const data = response.data?.data ?? response.data;
          setProfileData(typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null);
        }
      } catch {
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('user');
            if (raw) setProfileData(JSON.parse(raw) as Record<string, unknown>);
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayUser = useMemo(() => {
    if (profileData) return profileData as Record<string, unknown>;
    return (user ?? {}) as Record<string, unknown>;
  }, [profileData, user]);

  const initials = useMemo(() => {
    const source = displayUser?.name || displayUser?.email || '';
    const parts = String(source).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(source).slice(0, 1).toUpperCase() || 'A';
  }, [displayUser]);

  const formatDate = (v: unknown) => {
    if (v == null) return '—';
    if (typeof v === 'string') {
      try {
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Profile"
            description="Your admin account details"
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile summary card */}
            <Card className={modernTableCardClasses.card}>
              <CardHeader className={`${modernTableCardClasses.header} flex flex-col items-start gap-4`}>
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {initials}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{String(displayUser?.name ?? 'Admin')}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-0.5 text-sm">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{String(displayUser?.email ?? '—')}</span>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayUser?.role != null && (
                    <Badge variant="secondary">{String(displayUser.role)}</Badge>
                  )}
                  {kycStatusBadge(displayUser?.kycStatus as string)}
                </div>
              </CardHeader>
            </Card>

            {/* Basic details card */}
            <Card className={`${modernTableCardClasses.card} lg:col-span-2`}>
              <CardHeader className={modernTableCardClasses.header}>
                <div className="space-y-1">
                  <CardTitle>Basic Details</CardTitle>
                  <CardDescription className="mt-1">
                    Your account information
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className={labelClass}>Name</span>
                    <p className={valueClass}>{displayUser?.name != null ? String(displayUser.name) : '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>Email</span>
                    <p className={valueClass}>{displayUser?.email != null ? String(displayUser.email) : '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>Role</span>
                    <p className={valueClass}>{displayUser?.role != null ? String(displayUser.role) : '—'}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className={labelClass}>Unique ID</span>
                    <p className={`${valueClass} break-all font-mono text-xs`}>
                      {displayUser?.uniqueId != null ? String(displayUser.uniqueId) : displayUser?.id != null ? String(displayUser.id) : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className={labelClass}>KYC Status</span>
                    <div className="mt-0.5">{kycStatusBadge(displayUser?.kycStatus as string)}</div>
                  </div>
                  {(displayUser?.createdAt != null || displayUser?.created_at != null) && (
                    <div className="space-y-1">
                      <span className={labelClass}>Created at</span>
                      <p className={valueClass}>{formatDate(displayUser?.createdAt ?? displayUser?.created_at)}</p>
                    </div>
                  )}
                  {(displayUser?.status != null || displayUser?.accountStatus != null) && (
                    <div className="space-y-1">
                      <span className={labelClass}>Status</span>
                      <p className={valueClass}>{String(displayUser?.status ?? displayUser?.accountStatus ?? '—')}</p>
                    </div>
                  )}
                  {(displayUser?.phone != null || displayUser?.phoneNumber != null) && (
                    <div className="space-y-1">
                      <span className={labelClass}>Phone</span>
                      <p className={valueClass}>{String(displayUser?.phone ?? displayUser?.phoneNumber ?? '—')}</p>
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
