'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createUser, User } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createUserSchema,
  CreateUserSchemaType,
} from '@/lib/validations/admin/adminUsers/user-validation';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<CreateUserSchemaType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'admin',
      roleId: null,
      parentId: null,
    },
  });

  const onSubmit = async (data: CreateUserSchemaType) => {
    setIsSubmitting(true);
    try {
      const response = await createUser({
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
        roleId: data.roleId || null,
        parentId: data.parentId || null,
      });

      handleApiResponse<User>(response, {
        onSuccess: (userData) => {
          toast.success('User created successfully!');
          router.push('/admin/users');
        },
        onValidationError: (errors, messages) => {
          // Set form errors from API validation
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
        onError: (errorMessage, status) => {
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
              <Link href="/admin/users">
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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={passwordVisible ? 'text' : 'password'}
                              placeholder="Enter password"
                              {...field}
                              disabled={isSubmitting}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setPasswordVisible(!passwordVisible)}
                              disabled={isSubmitting}
                            >
                              {passwordVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={true}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Admin users can only have "admin" role
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter role ID (optional)"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.value : null
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter parent ID (optional)"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? e.target.value : null
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
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
