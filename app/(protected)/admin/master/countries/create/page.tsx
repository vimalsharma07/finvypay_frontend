'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
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
import { createCountry, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  createCountrySchema,
  CreateCountrySchemaType,
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

export default function CreateCountryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCountrySchemaType>({
    resolver: zodResolver(createCountrySchema),
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

  const onSubmit = async (data: CreateCountrySchemaType) => {
    setIsSubmitting(true);
    try {
      const response = await createCountry({
        countryName: data.countryName,
        local: data.local,
        phoneCode: data.phoneCode,
        isoTwo: data.isoTwo.toUpperCase(),
        isoThree: data.isoThree.toUpperCase(),
        flag: data.flag,
        currencyName: data.currencyName,
        currencyCode: data.currencyCode.toUpperCase(),
        currencySymbol: data.currencySymbol,
        continent: data.continent,
        status: data.status.toLowerCase(),
      });

      handleApiResponse<Country>(response, {
        onSuccess: (countryData) => {
          toast.success('Country created successfully!');
          router.push('/admin/master/countries');
        },
        onValidationError: (errors, messages) => {
          // Set form errors from API validation
          if (errors) {
            Object.entries(errors).forEach(([field, errorMessages]) => {
              if (Array.isArray(errorMessages) && errorMessages.length > 0) {
                form.setError(field as keyof CreateCountrySchemaType, {
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
          toast.error(errorMessage || 'Failed to create country');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create country error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Country"
            description="Add a new country to the system"
          />
        </Toolbar>
      </Container>
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Link href="/admin/master/countries">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle>Country Information</CardTitle>
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
                  <Link href="/admin/master/countries">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Country'}
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
