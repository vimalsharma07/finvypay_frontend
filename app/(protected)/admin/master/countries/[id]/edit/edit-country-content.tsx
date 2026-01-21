'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
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
import { getCountryById, updateCountry, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  updateCountrySchema,
  UpdateCountrySchemaType,
} from '@/lib/validations/admin/countries/country-validation';
import { toast } from 'sonner';

const CONTINENTS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
];

export function EditCountryContent() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<Country | null>(null);

  const form = useForm<UpdateCountrySchemaType>({
    resolver: zodResolver(updateCountrySchema),
    defaultValues: {
      countryName: '',
      local: '',
      phoneCode: '',
      isoTwo: '',
      isoThree: '',
      flag: '',
      currencyName: '',
      currencyCode: '',
      currencySymbol: '',
      continent: '',
      status: 'active',
    },
  });

  // Fetch country data
  useEffect(() => {
    const fetchCountry = async () => {
      if (!countryId) return;

      setLoading(true);
      try {
        const response = await getCountryById(countryId);

        handleApiResponse<Country>(response, {
          onSuccess: (countryData) => {
            console.log('Country data received:', countryData);
            setCountry(countryData);
            // Reset form with country data
            form.reset({
              countryName: countryData.countryName || '',
              local: countryData.local || '',
              phoneCode: countryData.phoneCode || '',
              isoTwo: countryData.isoTwo || '',
              isoThree: countryData.isoThree || '',
              flag: countryData.flag || '',
              currencyName: countryData.currencyName || '',
              currencyCode: countryData.currencyCode || '',
              currencySymbol: countryData.currencySymbol || '',
              continent: countryData.continent || '',
              status: countryData.status || 'active',
            });
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load country');
            router.push('/admin/master/countries');
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            router.push('/admin/master/countries');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch country error:', error);
        router.push('/admin/master/countries');
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countryId, router, form]);

  const onSubmit = async (data: UpdateCountrySchemaType) => {
    if (!countryId) return;

    setIsSubmitting(true);
    try {
      const payload: any = {};
      
      // Only include fields that have values
      if (data.countryName) payload.countryName = data.countryName;
      if (data.local) payload.local = data.local;
      if (data.phoneCode) payload.phoneCode = data.phoneCode;
      if (data.isoTwo) payload.isoTwo = data.isoTwo.toUpperCase();
      if (data.isoThree) payload.isoThree = data.isoThree.toUpperCase();
      if (data.flag) payload.flag = data.flag;
      if (data.currencyName) payload.currencyName = data.currencyName;
      if (data.currencyCode) payload.currencyCode = data.currencyCode.toUpperCase();
      if (data.currencySymbol) payload.currencySymbol = data.currencySymbol;
      if (data.continent) payload.continent = data.continent;
      if (data.status) payload.status = data.status.toLowerCase();

      const response = await updateCountry(countryId, payload);

      handleApiResponse<Country>(response, {
        onSuccess: (countryData) => {
          toast.success('Country updated successfully!');
          router.push('/admin/master/countries');
        },
        onValidationError: (errors, messages) => {
          // Set form errors from API validation
          if (errors) {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof UpdateCountrySchemaType, {
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
          toast.error(errorMessage || 'Failed to update country');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update country error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading...</div>
    );
  }

  if (!country) {
    return null;
  }

  return (
    <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Country Information</CardTitle>
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
                  name="countryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter country name"
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
                  name="local"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter local name"
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
                  name="phoneCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1, 44, 91"
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
                  name="isoTwo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISO 2 Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., US, GB, IN"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={2}
                          disabled={isSubmitting}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isoThree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISO 3 Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., USA, GBR, IND"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={3}
                          disabled={isSubmitting}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flag Emoji *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 🇺🇸, 🇬🇧, 🇮🇳"
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
                  name="currencyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., US Dollar, British Pound"
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
                  name="currencyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., USD, GBP, INR"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={3}
                          disabled={isSubmitting}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencySymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Symbol *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., $, £, ₹"
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
                  name="continent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Continent *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select continent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONTINENTS.map((continent) => (
                            <SelectItem key={continent} value={continent}>
                              {continent}
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Updating...' : 'Update Country'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
}

