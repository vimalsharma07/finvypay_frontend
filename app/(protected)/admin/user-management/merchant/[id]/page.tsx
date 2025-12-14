'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserById, User } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export default function ViewMerchantUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await getUserById(userId);

        handleApiResponse<User>(response, {
          onSuccess: (userData) => {
            setUser(userData);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load user');
            router.push('/admin/user-management/merchant');
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            router.push('/admin/user-management/merchant');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch user error:', error);
        router.push('/admin/user-management/merchant');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, router]);

  // Format date helper
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // Get initials for avatar
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Merchant User Details"
              description="View merchant user information"
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Merchant User Details"
            description="View merchant user information"
          />
          <ToolbarActions>
            <Link href="/admin/user-management/merchant">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/admin/user-management/merchant/${userId}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <Card className="min-w-full">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Profile Image
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={user.avatarUrl || user.profileImage || undefined}
                          alt={user.name || 'User'}
                        />
                        <AvatarFallback className="text-lg">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm text-muted-foreground">
                        {user.profileImage || user.avatarUrl
                          ? 'Profile image available'
                          : 'No profile image'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Name
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.name || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Email
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.email || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Role
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className="capitalize"
                      size="md"
                    >
                      {user.role || '-'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Status
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex gap-2">
                      <Badge
                        variant={user.isBlocked ? 'destructive' : 'success'}
                        size="md"
                        appearance="light"
                      >
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                      {user.isDeleted && (
                        <Badge variant="destructive" size="md" appearance="light">
                          Deleted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Unique ID
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm font-mono">
                    {user.uniqueId || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    User ID
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.id || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Parent ID
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.parentId || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-full mt-5">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Email Verified
                  </TableCell>
                  <TableCell className="py-3">
                    {user.emailVerifiedAt ? (
                      <div>
                        <Badge variant="success" size="md" appearance="light">
                          Verified
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(user.emailVerifiedAt)}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary" size="md" appearance="light">
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Two-Factor Authentication
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={user.isTwoFaEnabled ? 'success' : 'secondary'}
                      size="md"
                      appearance="light"
                    >
                      {user.isTwoFaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Provider
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" size="md" className="capitalize">
                      {user.provider || 'email'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Profile Completed
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={user.isProfileCompleted ? 'success' : 'secondary'}
                      size="md"
                      appearance="light"
                    >
                      {user.isProfileCompleted ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    KYC Completed
                  </TableCell>
                  <TableCell className="py-3">
                    {user.isKycCompleted === null ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <Badge
                        variant={user.isKycCompleted ? 'success' : 'secondary'}
                        size="md"
                        appearance="light"
                      >
                        {user.isKycCompleted ? 'Yes' : 'No'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Profile Step
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.profileStep ?? 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Entity Type
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {user.entityType || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-full mt-5">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="kt-scrollable-x-auto pb-3 p-0">
            <Table className="align-middle text-sm text-muted-foreground">
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 min-w-36 text-secondary-foreground font-normal">
                    Created At
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-secondary-foreground font-normal">
                    Updated At
                  </TableCell>
                  <TableCell className="py-3 text-foreground font-normal text-sm">
                    {formatDate(user.updatedAt)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
