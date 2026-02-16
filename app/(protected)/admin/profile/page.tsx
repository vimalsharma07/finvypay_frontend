'use client';

import { useEffect, useState, useMemo } from 'react';
import { User } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { getProfile } from '@/lib/services/auth';
import { Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const labelClass = 'text-xs uppercase tracking-wide text-muted-foreground';
const valueClass = 'text-sm font-semibold text-foreground';

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
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-col items-start gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  {initials}
                </div>
                <div>
                  <CardTitle className="text-xl">{String(displayUser?.name ?? 'Admin')}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4" />
                    {String(displayUser?.email ?? '—')}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayUser?.role != null && (
                    <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground">
                      {String(displayUser.role)}
                    </span>
                  )}
                  {kycStatusBadge(displayUser?.kycStatus as string)}
                </div>
              </CardHeader>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className={labelClass}>Name</div>
                    <div className={valueClass}>{displayUser?.name != null ? String(displayUser.name) : '—'}</div>
                  </div>
                  <div>
                    <div className={labelClass}>Email</div>
                    <div className={valueClass}>{displayUser?.email != null ? String(displayUser.email) : '—'}</div>
                  </div>
                  <div>
                    <div className={labelClass}>Role</div>
                    <div className={valueClass}>{displayUser?.role != null ? String(displayUser.role) : '—'}</div>
                  </div>
                  <div>
                    <div className={labelClass}>Unique ID</div>
                    <div className={valueClass + ' font-mono text-xs break-all'}>
                      {displayUser?.uniqueId != null ? String(displayUser.uniqueId) : displayUser?.id != null ? String(displayUser.id) : '—'}
                    </div>
                  </div>
                  <div>
                    <div className={labelClass}>KYC Status</div>
                    <div className={valueClass}>{kycStatusBadge(displayUser?.kycStatus as string)}</div>
                  </div>
                  {(displayUser?.status != null || displayUser?.accountStatus != null) && (
                    <div>
                      <div className={labelClass}>Status</div>
                      <div className={valueClass}>{String(displayUser?.status ?? displayUser?.accountStatus ?? '—')}</div>
                    </div>
                  )}
                  {(displayUser?.createdAt != null || displayUser?.created_at != null) && (
                    <div>
                      <div className={labelClass}>Created At</div>
                      <div className={valueClass}>{formatDate(displayUser?.createdAt ?? displayUser?.created_at)}</div>
                    </div>
                  )}
                  {(displayUser?.phone != null || displayUser?.phoneNumber != null) && (
                    <div>
                      <div className={labelClass}>Phone</div>
                      <div className={valueClass}>{String(displayUser?.phone ?? displayUser?.phoneNumber ?? '—')}</div>
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
