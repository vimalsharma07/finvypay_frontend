'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/common/container';
import { useAuth } from '@/hooks/use-auth';
import { Shield, KeyRound, Mail, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const labelClass = 'text-xs uppercase tracking-wide text-muted-foreground';
const valueClass = 'text-sm font-semibold text-foreground';

export default function UserProfilePage() {
  const { user } = useAuth();

  const initials = useMemo(() => {
    const source = user?.name || user?.email || '';
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 1).toUpperCase() || 'U';
  }, [user]);

  const statusBadge = (status?: string | null) => {
    if (!status) return null;
    const normalized = status.toLowerCase();
    if (normalized === 'approved' || normalized === 'active') {
      return <Badge variant="success">Approved</Badge>;
    }
    if (normalized === 'pending') {
      return <Badge variant="warning">Pending</Badge>;
    }
    return <Badge variant="destructive">{status}</Badge>;
  };

  return (
    <Container>
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-3">
        {/* Profile summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-start gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <CardTitle className="text-xl">{user?.name || 'User'}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email || 'Email not available'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.role && <Badge variant="outline">{user.role}</Badge>}
              {statusBadge((user as any)?.kycStatus)}
              {(user as any)?.isProfileCompleted && <Badge variant="success">Profile Completed</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="primary" className="w-full" asChild>
              <a href="/user/onboarding">
                {(user as any)?.kycStatus === 'approved' ? 'View Onboarding' : 'Complete Onboarding'}
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your basic information and keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className={labelClass}>Name</div>
                <div className={valueClass}>{user?.name || '-'}</div>
              </div>
              <div>
                <div className={labelClass}>Email</div>
                <div className={valueClass}>{user?.email || '-'}</div>
              </div>
              <div>
                <div className={labelClass}>Role</div>
                <div className={valueClass}>{user?.role || '-'}</div>
              </div>
              <div>
                <div className={labelClass}>Unique ID</div>
                <div className={valueClass}>{(user as any)?.uniqueId || '-'}</div>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Encryption Key</div>
                  <div className="text-xs text-muted-foreground break-all">
                    {(user as any)?.encryptionKey || 'Not available'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <KeyRound className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Test Secret Key</div>
                  <div className="text-xs text-muted-foreground break-all">
                    {(user as any)?.testSecretKey || 'Not available'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>IP Whitelist: {(user as any)?.ipEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>BIN Check: {(user as any)?.binEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Card WL: {(user as any)?.cardWlEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-warning" />
                <span>KYC Status: {(user as any)?.kycStatus || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-info" />
                <span>Profile Step: {(user as any)?.profileStep ?? '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}


