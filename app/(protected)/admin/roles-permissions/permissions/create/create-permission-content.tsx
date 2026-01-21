'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPermission, CreatePermissionPayload } from '@/lib/services/admin/permissions';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  identifier: z.string().min(1, 'Identifier is required'),
  route: z.string().min(1, 'Route is required'),
  method: z.string().min(1, 'Method is required'),
  frontendRoute: z.string().min(1, 'Frontend route is required'),
  module: z.string().min(1, 'Module is required'),
  subModule: z.string().min(1, 'SubModule is required'),
  type: z.string().min(1, 'Type is required'),
});

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;

export function CreatePermissionContent() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
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

  const onSubmit = async (data: CreatePermissionFormData) => {
    setSubmitting(true);
    try {
      const payload: CreatePermissionPayload = {
        name: data.name,
        identifier: data.identifier,
        route: data.route,
        method: data.method,
        frontendRoute: data.frontendRoute,
        module: data.module,
        subModule: data.subModule,
        type: data.type,
      };

      const response = await createPermission(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Permission created successfully!');
          router.push('/admin/roles-permissions/permissions');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create permission');
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
      console.error('❌ Error creating permission:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Information</CardTitle>
      </CardHeader>
      <CardContent>
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

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/roles-permissions/permissions')}
                disabled={submitting}
              >
                <X className="h-4 w-4 me-1" />
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                <Plus className="h-4 w-4 me-1" />
                {submitting ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

