'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createUser, User } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserSchema,
  CreateUserSchemaType,
} from '@/lib/validations/admin/adminUsers/user-validation';
import { RoleSelectField } from '@/components/common/role-select-field';
import { PasswordField } from '@/components/common/password-field';
import { useRoles } from '@/hooks/use-roles';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { roles, loadingRoles } = useRoles({ type: 'ADMIN' });

  const form = useForm<CreateUserSchemaType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: '',
      roleId: '',
    },
  });

  const onSubmit = async (data: CreateUserSchemaType) => {
    setIsSubmitting(true);
    try {
      const selectedRole = roles.find((role) => role.id.toString() === data.roleId);

      const response = await createUser({
        email: data.email,
        name: data.name,
        password: data.password,
        role: selectedRole?.name || data.role,
        roleId: data.roleId || null,
      });

      handleApiResponse<User>(response, {
        onSuccess: () => {
          toast.success('User created successfully!');
          router.push('/admin/user-management/admin');
        },
        onValidationError: (errors, messages) => {
          if (errors) {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof CreateUserSchemaType, {
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
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create user');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create User"
            description="Add a new user to the system"
          />
        </Toolbar>
      </Container>
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Link href="/admin/user-management/admin">
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

                  <PasswordField
                    control={form.control}
                    disabled={isSubmitting}
                  />

                  <RoleSelectField
                    control={form.control}
                    disabled={isSubmitting}
                    roles={roles}
                    loadingRoles={loadingRoles}
                    onRoleChange={(roleId, roleName) => {
                      form.setValue('role', roleName);
                    }}
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
                    {isSubmitting ? 'Creating...' : 'Create User'}
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
