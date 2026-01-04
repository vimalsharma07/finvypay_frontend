'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getPermissionById,
  updatePermission,
  UpdatePermissionPayload,
  Permission,
} from '@/lib/services/admin/permissions';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const updatePermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  identifier: z.string().min(1, 'Identifier is required'),
  route: z.string().min(1, 'Route is required'),
  method: z.string().min(1, 'Method is required'),
  frontendRoute: z.string().min(1, 'Frontend route is required'),
  module: z.string().min(1, 'Module is required'),
  subModule: z.string().min(1, 'SubModule is required'),
  type: z.string().min(1, 'Type is required'),
});

type UpdatePermissionFormData = z.infer<typeof updatePermissionSchema>;

export function EditPermissionContent() {
  const router = useRouter();
  const params = useParams();
  const permissionId = params?.id as string;

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdatePermissionFormData>({
    resolver: zodResolver(updatePermissionSchema),
    defaultValues: {
      name: '',
      identifier: '',
      route: '',
      method: 'GET',
      frontendRoute: '',
      module: '',
      subModule: '',
      type: 'ADMIN',
    },
  });

  // Fetch permission on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!permissionId) {
        toast.error('Permission ID is missing');
        router.push('/admin/permissions');
        return;
      }

      setLoading(true);
      try {
        const response = await getPermissionById(permissionId);

        handleApiResponse(response, {
          onSuccess: (permissionData) => {
            if (permissionData) {
              setPermission(permissionData);
              
              // Populate form with permission data
              form.reset({
                name: permissionData.name || '',
                identifier: permissionData.identifier || '',
                route: permissionData.route || '',
                method: permissionData.method || 'GET',
                frontendRoute: permissionData.frontendRoute || '',
                module: permissionData.module || '',
                subModule: permissionData.subModule || '',
                type: permissionData.type || 'ADMIN',
              });
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load permission');
            router.push('/admin/permissions');
          },
        });
      } catch (error) {
        console.error('Error fetching permission:', error);
        toast.error('An error occurred while loading permission');
        router.push('/admin/permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [permissionId, router, form]);

  const onSubmit = async (data: UpdatePermissionFormData) => {
    if (!permissionId) {
      toast.error('Permission ID is missing');
      return;
    }

    setSubmitting(true);
    try {
      const payload: UpdatePermissionPayload = {
        name: data.name,
        identifier: data.identifier,
        route: data.route,
        method: data.method,
        frontendRoute: data.frontendRoute,
        module: data.module,
        subModule: data.subModule,
        type: data.type,
      };

      const response = await updatePermission(permissionId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Permission updated successfully!');
          router.push('/admin/permissions');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update permission');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      console.error('❌ Error updating permission:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Loading permission data...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!permission) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Permission not found</p>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/permissions')}
              className="mt-4"
            >
              Back to Permissions
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Permission Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Create User"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Identifier <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CU001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Route <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., /users"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      HTTP Method <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frontendRoute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Frontend Route <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., /admin/users/create"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Module <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Users"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subModule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      SubModule <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Management"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="MERCHANT">MERCHANT</SelectItem>
                          <SelectItem value="AFFILIATE">AFFILIATE</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/permissions')}
                disabled={submitting}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                <Save className="h-4 w-4" />
                {submitting ? 'Updating...' : 'Update Permission'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Container>
  );
}

