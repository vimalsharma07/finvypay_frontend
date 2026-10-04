'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Users, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { initializeOnboarding, InitializeOnboardingPayload } from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

const kycTypeSchema = z.object({
  kycType: z.enum(['individual', 'company', 'partnership'], {
    required_error: 'Please select an account type',
  }),
});

type KycTypeFormData = z.infer<typeof kycTypeSchema>;

interface Step1KycTypeProps {
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: InitializeOnboardingPayload) => void;
}

const kycTypeOptions = [
  {
    value: 'individual' as const,
    label: 'Individual',
    description: 'For personal accounts and sole proprietors',
    icon: User,
  },
  {
    value: 'company' as const,
    label: 'Company',
    description: 'For registered business entities',
    icon: Building2,
  },
  {
    value: 'partnership' as const,
    label: 'Partnership',
    description: 'For partnership businesses',
    icon: Users,
  },
];

export function Step1KycType({ onNext, onBack, onUpdate }: Step1KycTypeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<KycTypeFormData>({
    resolver: zodResolver(kycTypeSchema),
    defaultValues: {
      kycType: undefined,
    },
    mode: 'onChange',
  });

  const handleSubmit = async (data: KycTypeFormData) => {
    setIsSubmitting(true);
    try {
      const response = await initializeOnboarding({ kycType: data.kycType });
      handleApiResponse(response, {
        onSuccess: async (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Onboarding initialized successfully');
            // Update parent state and refresh data - this will also advance to step 2
            await onUpdate({ kycType: data.kycType });
            // onNext() is now handled in handleKycTypeUpdate
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to initialize onboarding');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Initialize onboarding error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
      <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
        <CardTitle>Business Type</CardTitle>
        <CardDescription>Choose the structure that matches your business</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="kycType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-3"
                    >
                      {kycTypeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.value;

                        return (
                          <label
                            key={option.value}
                            htmlFor={option.value}
                            className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                              isSelected
                                ? 'border-sky-400 bg-sky-50/80 shadow-sm shadow-sky-500/10 dark:border-sky-500 dark:bg-sky-950/30'
                                : 'border-sky-100 hover:border-sky-300 dark:border-sky-900/40 dark:hover:border-sky-700'
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="mt-0.5"
                            />
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                isSelected
                                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div
                                className={`mb-1 font-semibold ${
                                  isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-foreground'
                                }`}
                              >
                                {option.label}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="gap-2 rounded-xl">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !form.watch('kycType')}
                className="gap-2 rounded-xl shadow-sm shadow-sky-500/20"
              >
                {isSubmitting ? 'Starting...' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

