'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChevronRight } from 'lucide-react';
import { submitAffiliateOnboardingStep1 } from '@/lib/services/affiliate/onboarding';
import { getAffiliateProfile } from '@/lib/services/affiliate/profile';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { useCountries } from '@/lib/hooks/use-countries';
import { CountryCodeSelector } from '@/app/(protected)/(merchant)/onboarding/components/country-code-selector';

const step1Schema = z
  .object({
    rpName: z.string().min(1, 'Affiliate name is required').max(255),
    countryCodeId: z.number().min(1, 'Country code is required'),
    phoneNumber: z.string().min(1, 'Phone number is required').max(50),
    email: z.string().email('Invalid email').max(255),
    countryId: z.number().min(1, 'Country is required'),
    poiFile: z.any().optional(),
    poaFile: z.any().optional(),
  })
  .refine(
    (data) => {
      const poi = data.poiFile as FileList | undefined;
      const poa = data.poaFile as FileList | undefined;
      return poi?.length && poa?.length;
    },
    { message: 'Please upload both POI and POA documents', path: ['poiFile'] }
  )
  .refine(
    (data) => {
      const poi = data.poiFile as FileList | undefined;
      const poa = data.poaFile as FileList | undefined;
      return poi?.length && poa?.length;
    },
    { message: 'Please upload both POI and POA documents', path: ['poaFile'] }
  );

type Step1FormValues = z.infer<typeof step1Schema>;

interface Step1DetailsProps {
  /** Called when step 1 succeeds; pass affiliate name for use in step 2 agreement. */
  onNext: (affiliateName?: string) => void;
}

export function Step1Details({ onNext }: Step1DetailsProps) {
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { countries } = useCountries();

  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    mode: 'onSubmit',
    defaultValues: {
      rpName: '',
      countryCodeId: undefined as unknown as number,
      phoneNumber: '',
      email: '',
      countryId: undefined as unknown as number,
      poiFile: undefined,
      poaFile: undefined,
    },
  });

  // Default phone country code and country to US when countries load
  const defaultCountryCodeId = useMemo(() => {
    const us = countries.find((c) => c.isoTwo === 'US');
    return us ? Number(us.id) : undefined;
  }, [countries]);
  const defaultCountryId = useMemo(() => {
    const us = countries.find((c) => c.isoTwo === 'US');
    return us ? Number(us.id) : undefined;
  }, [countries]);

  useEffect(() => {
    if (defaultCountryCodeId == null) return;
    const current = form.getValues('countryCodeId');
    if (current == null || current === 0) {
      form.setValue('countryCodeId', defaultCountryCodeId);
    }
  }, [defaultCountryCodeId, form]);

  useEffect(() => {
    if (defaultCountryId == null) return;
    const current = form.getValues('countryId');
    if (current == null || current === 0) {
      form.setValue('countryId', defaultCountryId);
    }
  }, [defaultCountryId, form]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAffiliateProfile();
        handleApiResponse(res, {
          onSuccess: (data) => {
            if (cancelled || !data?.data) return;
            const profile = data.data;
            form.reset({
              rpName: profile.name ?? '',
              countryCodeId: form.getValues('countryCodeId') || defaultCountryCodeId || (undefined as unknown as number),
              phoneNumber: form.getValues('phoneNumber') || '',
              email: profile.email ?? '',
              countryId: form.getValues('countryId') || defaultCountryId || (undefined as unknown as number),
              poiFile: undefined,
              poaFile: undefined,
            });
          },
          silent: true,
        });
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (values: Step1FormValues) => {
    const poiFileList = values.poiFile as FileList | undefined;
    const poaFileList = values.poaFile as FileList | undefined;
    const poiFile = poiFileList?.length ? poiFileList[0] : null;
    const poaFile = poaFileList?.length ? poaFileList[0] : null;
    if (!poiFile || !poaFile) return; // Schema validation already shows inline errors
    const selectedPhoneCountry = countries.find((c) => Number(c.id) === values.countryCodeId);
    const phoneCountryCode = selectedPhoneCountry?.phoneCode
      ? `+${selectedPhoneCountry.phoneCode.replace(/^\+/, '')}`
      : '';
    const selectedCountry = countries.find((c) => Number(c.id) === values.countryId);
    const countryIso = selectedCountry?.isoTwo ?? '';
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rpName', values.rpName);
      formData.append('phoneCountryCode', phoneCountryCode);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('email', values.email);
      formData.append('country', countryIso);
      formData.append('poiFile', poiFile);
      formData.append('poaFile', poaFile);

      const response = await submitAffiliateOnboardingStep1(formData);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Step 1 submitted successfully');
          onNext(values.rpName);
        },
        onError: (msg) => toast.error(msg || 'Failed to submit'),
        onValidationError: (_, messages) =>
          toast.error(Array.isArray(messages) ? messages.join(', ') : 'Validation error'),
      });
    } catch (e) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (prefillLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Your details and documents</CardTitle>
        <CardDescription>
          Submit your details and documents (POI, POA).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rpName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliate Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Affiliate Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="countryCodeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone country code <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <CountryCodeSelector
                        value={field.value}
                        onChange={field.onChange}
                        showPhoneCode={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="rp@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <CountryCodeSelector
                      value={field.value}
                      onChange={field.onChange}
                      showPhoneCode={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="poiFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proof of Identity (POI) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files ?? undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="poaFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proof of Address (POA) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files ?? undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? 'Submitting...' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
