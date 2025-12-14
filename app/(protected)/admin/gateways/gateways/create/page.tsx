'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createGateway, CreateGatewayPayload } from '@/lib/services/admin/gateways';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const createGatewaySchema = z.object({
  gatewayName: z.string().min(1, 'Gateway name is required'),
  fileName: z.string().min(1, 'File name is required'),
  fields: z
    .array(
      z.object({
        fieldName: z.string().optional(),
        fieldValue: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

type CreateGatewayFormData = z.infer<typeof createGatewaySchema>;

export default function CreateGatewayPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateGatewayFormData>({
    resolver: zodResolver(createGatewaySchema),
    defaultValues: {
      gatewayName: '',
      fileName: '',
      fields: [{ fieldName: '', fieldValue: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const onSubmit = async (data: CreateGatewayFormData) => {
    setSubmitting(true);
    try {
      // Convert fields array to object format (only include non-empty fields)
      const fieldsObject: Record<string, string> = {};
      data.fields?.forEach((field) => {
        if (field.fieldName?.trim() && field.fieldValue?.trim()) {
          fieldsObject[field.fieldName.trim()] = field.fieldValue.trim();
        }
      });

      const payload: CreateGatewayPayload = {
        gatewayName: data.gatewayName.trim(),
        fileName: data.fileName.trim(),
        fields: fieldsObject,
      };

      const response = await createGateway(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Gateway created successfully!');
          router.push('/admin/gateways/gateways');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create gateway');
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
      console.error('❌ Error creating gateway:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Gateway"
            description="Create a new payment gateway"
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
                  {submitting ? 'Creating...' : 'Create Gateway'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Container>
    </Fragment>
  );
}

