'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { X, Plus } from 'lucide-react';
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
} from '@/lib/validations/admin/merchantUsers/user-validation';
import { PasswordField } from '@/components/common/password-field';
import { toast } from 'sonner';
import { getRoles } from '@/lib/services/admin/roles';

export function CreateMerchantContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [standardUserRoleId, setStandardUserRoleId] = useState<number | null>(null);
  const [loadingRoleId, setLoadingRoleId] = useState(true);

  const form = useForm<CreateUserSchemaType>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      roleId: '', // Will be auto-assigned to Standard Merchant
    },
  });

  // Fetch Standard Merchant role ID on mount
  useEffect(() => {
    const fetchStandardUserRoleId = async () => {
      setLoadingRoleId(true);
      try {
        const response = await getRoles('MERCHANT');
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && Array.isArray(data.data)) {
              // Find "Standard Merchant" role
              const standardUser = data.data.find(
                (role: any) => role.name === 'Standard Merchant'
              );
              if (standardUser) {
                setStandardUserRoleId(Number(standardUser.id));
                // Auto-set roleId in form
                form.setValue('roleId', standardUser.id.toString());
              } else {
                toast.error('Standard Merchant role not found');
              }
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch Standard Merchant role');
          },
        });
      } catch (error) {
        console.error('Error fetching Standard Merchant role:', error);
        toast.error('Failed to fetch Standard Merchant role');
      } finally {
        setLoadingRoleId(false);
      }
    };

    fetchStandardUserRoleId();
  }, [form]);

  const onSubmit = async (data: CreateUserSchemaType) => {
    setIsSubmitting(true);
    try {
      // CRITICAL: Force Standard Merchant roleId (backend will also enforce this)
      const roleIdToUse = standardUserRoleId || Number(data.roleId);
      
      const response = await createUser({
        email: data.email,
        name: data.name,
        password: data.password,
        roleId: roleIdToUse, // Always use Standard Merchant roleId
      });

      handleApiResponse<User>(response, {
        onSuccess: () => {
          toast.success('Merchant created successfully!');
          router.push('/admin/user-management/merchant');
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
          toast.error(errorMessage || 'Failed to create merchant');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create merchant error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Merchant Information</CardTitle>
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
                          placeholder="Enter merchant name"
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

                {/* Role field removed - Standard Merchant is auto-assigned */}
                {/* Role is hidden from UI as per requirements */}
                {loadingRoleId && (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Loading...
                    </div>
                  </FormItem>
                )}
                {!loadingRoleId && standardUserRoleId && (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Standard Merchant (auto-assigned)
                    </div>
                  </FormItem>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 me-1" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 me-1" />
                  {isSubmitting ? 'Creating...' : 'Create Merchant'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}

