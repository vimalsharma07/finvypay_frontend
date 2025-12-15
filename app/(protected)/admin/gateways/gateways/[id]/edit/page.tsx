'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
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
  getGatewayById,
  updateGateway,
  UpdateGatewayPayload,
  Gateway,
} from '@/lib/services/admin/gateways';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const updateGatewaySchema = z.object({
  gatewayName: z.string().min(1, 'Gateway name is required'),
  fileName: z.string().min(1, 'File name is required'),
  status: z.string().min(1, 'Status is required'),
  fields: z.array(
    z.object({
      fieldName: z.string().optional(),
      fieldValue: z.string().optional(),
    })
  ),
});

type UpdateGatewayFormData = z.infer<typeof updateGatewaySchema>;

export default function EditGatewayPage() {
  const router = useRouter();
  const params = useParams();
  const gatewayId = params?.id as string;

  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdateGatewayFormData>({
    resolver: zodResolver(updateGatewaySchema),
    defaultValues: {
      gatewayName: '',
      fileName: '',
      status: 'active',
      fields: [{ fieldName: '', fieldValue: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  // Fetch gateway on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!gatewayId) {
        toast.error('Gateway ID is missing');
        router.push('/admin/gateways/gateways');
        return;
      }

      setLoading(true);
      try {
        const response = await getGatewayById(gatewayId);

        handleApiResponse<Gateway>(response, {
          onSuccess: (gatewayData) => {
            if (gatewayData) {
              setGateway(gatewayData);

              // Convert fields object to array format
              const fieldsArray = Object.entries(gatewayData.fields || {}).map(
                ([fieldName, fieldValue]) => ({
                  fieldName,
                  fieldValue: String(fieldValue || ''),
                })
              );

              // If no fields, show one empty field
              const formFields = fieldsArray.length > 0 
                ? fieldsArray 
                : [{ fieldName: '', fieldValue: '' }];

              // Populate form with gateway data
              const formData = {
                gatewayName: gatewayData.gatewayName || '',
                fileName: gatewayData.fileName || '',
                status: gatewayData.status || 'active',
                fields: formFields,
              };

              // Reset form with all data
              form.reset(formData);
              
              // Replace field array to ensure proper rendering
              replace(formFields);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load gateway');
            router.push('/admin/gateways/gateways');
          },
        });
      } catch (error) {
        console.error('Error fetching gateway:', error);
        toast.error('An error occurred while loading gateway');
        router.push('/admin/gateways/gateways');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatewayId, router]);

  const onSubmit = async (data: UpdateGatewayFormData) => {
    if (!gatewayId) {
      toast.error('Gateway ID is missing');
      return;
    }

    setSubmitting(true);
    try {
      // Convert fields array to object format (only include non-empty fields)
      const fieldsObject: Record<string, string> = {};
      data.fields?.forEach((field) => {
        if (field.fieldName?.trim() && field.fieldValue?.trim()) {
          fieldsObject[field.fieldName.trim()] = field.fieldValue.trim();
        }
      });

      const payload: UpdateGatewayPayload = {
        gatewayName: data.gatewayName.trim(),
        fileName: data.fileName.trim(),
        status: data.status,
        fields: fieldsObject,
      };

      const response = await updateGateway(gatewayId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Gateway updated successfully!');
          router.push('/admin/gateways/gateways');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update gateway');
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
      console.error('❌ Error updating gateway:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Gateway"
              description="Update gateway details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading gateway data...</p>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!gateway) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Gateway"
              description="Update gateway details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Gateway not found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/gateways/gateways')}
                className="mt-4"
              >
                Back to Gateways
              </Button>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Edit Gateway"
            description="Update gateway details"
          />
          <div className="flex items-center">
            <Link
              href="/admin/gateways/gateways"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </div>
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gatewayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gateway Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Gateway Name"
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        File Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter File Name"
                          {...field}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fields Section */}
              <div className="space-y-4">
                <FormLabel>Fields: <span className="text-muted-foreground font-normal text-sm">(Optional)</span></FormLabel>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.fieldName`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="sr-only">Field Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Field Name"
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`fields.${index}.fieldValue`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="sr-only">Field Value</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Field Value"
                                {...field}
                                disabled={submitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-0 shrink-0"
                          onClick={() => remove(index)}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ fieldName: '', fieldValue: '' })}
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/gateways/gateways')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Gateway'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

