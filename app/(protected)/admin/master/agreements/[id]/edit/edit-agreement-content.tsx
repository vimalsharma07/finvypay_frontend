'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  getAgreementById,
  updateAgreement,
  UpdateAgreementPayload,
  Agreement,
} from '@/lib/services/admin/agreements';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  updateAgreementSchema,
  UpdateAgreementSchemaType,
} from '@/lib/validations/admin/agreements/agreement-validation';
import { toast } from 'sonner';

const AGREEMENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export function EditAgreementContent() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params?.id as string;

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAgreementSchemaType>({
    resolver: zodResolver(updateAgreementSchema),
    defaultValues: {
      name: '',
      desc: '',
      status: 'active',
    },
  });

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!agreementId) {
        toast.error('Agreement ID is missing');
        router.push('/admin/master/agreements');
        return;
      }

      setLoading(true);
      try {
        const response = await getAgreementById(agreementId);

        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data) {
              setAgreement(data);
              form.reset({
                name: data.name,
                desc: data.desc ?? '',
                status: data.status?.toLowerCase() ?? 'active',
              });
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load agreement');
            router.push('/admin/master/agreements');
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            router.push('/admin/master/agreements');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch agreement error:', error);
        router.push('/admin/master/agreements');
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [agreementId, router, form]);

  const onSubmit = async (data: UpdateAgreementSchemaType) => {
    if (!agreementId) return;

    setIsSubmitting(true);
    try {
      const payload: UpdateAgreementPayload = {
        name: data.name,
        desc: data.desc,
        status: data.status.toLowerCase(),
      };

      const response = await updateAgreement(agreementId, payload);

      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Agreement updated successfully!');
          router.push('/admin/master/agreements');
        },
        onValidationError: (errors, messages) => {
          if (errors && typeof errors === 'object') {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof UpdateAgreementSchemaType, {
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
          toast.error(errorMessage || 'Failed to update agreement');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update agreement error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-md">
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading agreement...
        </CardContent>
      </Card>
    );
  }

  if (!agreement) {
    return null;
  }

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Agreement Information</CardTitle>
        {agreement.type && (
          <p className="text-sm text-muted-foreground mt-1">
            Type: <Badge variant="secondary" className="capitalize">{agreement.type}</Badge> (read-only)
          </p>
        )}
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
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
