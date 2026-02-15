'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAgreement, CreateAgreementPayload } from '@/lib/services/admin/agreements';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createAgreementSchema,
  CreateAgreementSchemaType,
} from '@/lib/validations/admin/agreements/agreement-validation';
import { toast } from 'sonner';

const AGREEMENT_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'merchant', label: 'Merchant' },
] as const;

const AGREEMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export function CreateAgreementContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAgreementSchemaType>({
    resolver: zodResolver(createAgreementSchema),
    defaultValues: {
      name: '',
      type: 'user',
      desc: '',
      status: 'active',
    },
  });

  const onSubmit = async (data: CreateAgreementSchemaType) => {
    setIsSubmitting(true);
    try {
      const payload: CreateAgreementPayload = {
        name: data.name,
        type: data.type.toLowerCase(),
        desc: data.desc,
        status: data.status.toLowerCase(),
      };

      const response = await createAgreement(payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Agreement created successfully!');
          router.push('/admin/master/agreements');
        },
        onValidationError: (errors, messages) => {
          if (errors && typeof errors === 'object') {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof CreateAgreementSchemaType, {
                  type: 'server',
                  message: errorMessages[0],
                });
              }
            });
          }
          const msg = Array.isArray(messages) ? messages[0] : typeof messages === 'string' ? messages : 'Validation failed';
          toast.error(msg);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create agreement');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create agreement error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Agreement Information</CardTitle>
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
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., User Terms and Conditions"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGREEMENT_TYPES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGREEMENT_STATUSES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the agreement terms and conditions..."
                      className="min-h-[120px] resize-y"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admin/master/agreements">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                <Plus className="h-4 w-4" />
                {isSubmitting ? 'Creating...' : 'Create Agreement'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
