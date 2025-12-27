'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getUserById, updateUser, User } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  updateUserSchema,
  UpdateUserSchemaType,
} from '@/lib/validations/admin/merchantUsers/user-validation';
import { toast } from 'sonner';

export default function EditMerchantUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<UpdateUserSchemaType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: '', // Will be set from user data, but not editable
      isBlocked: false,
      isDeleted: false,
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await getUserById(userId);

        handleApiResponse<User>(response, {
          onSuccess: (userData) => {
            console.log('User data received:', userData);
            setUser(userData);
            
            // Reset form with user data
            // CRITICAL: For MERCHANT category, roleId is set but not editable
            form.reset({
              name: userData.name || '',
              email: userData.email || '',
              roleId: userData.roleId?.toString() || '',
              isBlocked: userData.isBlocked ?? false,
              isDeleted: userData.isDeleted ?? false,
            });
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load merchant');
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
  }, [userId, router, form]);

  // Role is non-editable for MERCHANT category - no need to fetch roles

  const onSubmit = async (data: UpdateUserSchemaType) => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      // CRITICAL: For MERCHANT category, roleId cannot be changed
      // Backend will enforce this, but we don't send roleId for MERCHANT category
      const updatePayload: any = {
        name: data.name,
        email: data.email,
        // isBlocked: data.isBlocked,
        // isDeleted: data.isDeleted,
      };
      
      // Only include roleId if user is not MERCHANT category (backend will handle MERCHANT category)
      // For MERCHANT category, backend will ignore roleId changes
      if (user && user.role !== 'merchant') {
        updatePayload.roleId = Number(data.roleId);
      }
      
      const response = await updateUser(userId, updatePayload);

      handleApiResponse<User>(response, {
        onSuccess: (userData) => {
          toast.success('Merchant updated successfully!');
          router.push('/admin/user-management/merchant');
        },
        onValidationError: (errors, messages) => {
          // Set form errors from API validation
          if (errors) {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof UpdateUserSchemaType, {
                  type: 'server',
                  message: errorMessages[0],
                });
              }
            });
          }
          const errorMessage = Array.isArray(messages)
            ? messages[0]
            : typeof messages === 'string'
              ? messages
              : 'Validation failed';
          toast.error(errorMessage);
        },
        onError: (errorMessage, status) => {
          toast.error(errorMessage || 'Failed to update merchant');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Merchant"
              description="Update merchant information"
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
            title="Edit Merchant User"
            description="Update merchant user information"
          />
        </Toolbar>
      </Container>
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Link href={`/admin/user-management/merchant/${userId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle>User Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter user name"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role field - non-editable for MERCHANT category */}
                  {user && user.role === 'merchant' ? (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Standard Merchant (cannot be changed)
                      </div>
                      <input
                        type="hidden"
                        {...form.register('roleId')}
                        value={user.roleId?.toString() || ''}
                      />
                    </FormItem>
                  ) : (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {user?.role || 'N/A'} (role changes not supported for MERCHANT category)
                      </div>
                      <input
                        type="hidden"
                        {...form.register('roleId')}
                        value={user?.roleId?.toString() || ''}
                      />
                    </FormItem>
                  )}

                  <FormField
                    control={form.control}
                    name="isBlocked"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Blocked Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Block or unblock this user
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDeleted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Deleted Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mark user as deleted
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
