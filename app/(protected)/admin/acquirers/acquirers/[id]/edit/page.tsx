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
  getAcquirerById,
  updateAcquirer,
  UpdateAcquirerPayload,
  Acquirer,
} from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const updateAcquirerSchema = z.object({
  acquirerName: z.string().min(1, 'Acquirer name is required'),
  fileName: z.string().min(1, 'File name is required'),
  status: z.string().min(1, 'Status is required'),
  fields: z.array(
    z.object({
      fieldName: z.string().optional(),
      fieldValue: z.string().optional(),
    })
  ),
});

type UpdateAcquirerFormData = z.infer<typeof updateAcquirerSchema>;

export default function EditAcquirerPage() {
  const router = useRouter();
  const params = useParams();
  const acquirerId = params?.id as string;

  const [acquirer, setAcquirer] = useState<Acquirer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UpdateAcquirerFormData>({
    resolver: zodResolver(updateAcquirerSchema),
    defaultValues: {
      acquirerName: '',
      fileName: '',
      status: 'active',
      fields: [{ fieldName: '', fieldValue: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  // Fetch acquirer on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!acquirerId) {
        toast.error('Acquirer ID is missing');
        router.push('/admin/acquirers');
        return;
      }

      setLoading(true);
      try {
        const response = await getAcquirerById(acquirerId);

        handleApiResponse<Acquirer>(response, {
          onSuccess: (acquirerData) => {
            if (acquirerData) {
              setAcquirer(acquirerData);

              // Convert fields object to array format
              const fieldsArray = Object.entries(acquirerData.fields || {}).map(
                ([fieldName, fieldValue]) => ({
                  fieldName,
                  fieldValue: String(fieldValue || ''),
                })
              );

              // If no fields, show one empty field
              const formFields = fieldsArray.length > 0 
                ? fieldsArray 
                : [{ fieldName: '', fieldValue: '' }];

              // Populate form with acquirer data
              const formData = {
                acquirerName: acquirerData.acquirerName || '',
                fileName: acquirerData.fileName || '',
                status: acquirerData.status || 'active',
                fields: formFields,
              };

              // Reset form with all data
              form.reset(formData);
              
              // Replace field array to ensure proper rendering
              replace(formFields);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load acquirer');
            router.push('/admin/acquirers');
          },
        });
      } catch (error) {
        console.error('Error fetching acquirer:', error);
        toast.error('An error occurred while loading acquirer');
        router.push('/admin/acquirers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acquirerId, router]);

  const onSubmit = async (data: UpdateAcquirerFormData) => {
    if (!acquirerId) {
      toast.error('Acquirer ID is missing');
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

      const payload: UpdateAcquirerPayload = {
        acquirerName: data.acquirerName.trim(),
        fileName: data.fileName.trim(),
        status: data.status,
        fields: fieldsObject,
      };

      const response = await updateAcquirer(acquirerId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer updated successfully!');
          router.push('/admin/acquirers');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update acquirer');
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
      console.error('❌ Error updating acquirer:', error);
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
              title="Edit Acquirer"
              description="Update acquirer details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading acquirer data...</p>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!acquirer) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Edit Acquirer"
              description="Update acquirer details"
            />
          </Toolbar>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Acquirer not found</p>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/acquirers')}
                className="mt-4"
              >
                Back to Acquirers
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
            title="Edit Acquirer"
            description="Update acquirer details"
          />
          <div className="flex items-center">
            <Link
              href="/admin/acquirers"
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
                  name="acquirerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Acquirer Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Acquirer Name"
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
                  onClick={() => router.push('/admin/acquirers')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Acquirer'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

