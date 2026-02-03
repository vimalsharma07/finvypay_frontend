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
import { Building2, Users, User, ChevronRight } from 'lucide-react';
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

export function Step1KycType({ onNext, onUpdate }: Step1KycTypeProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Account Type</CardTitle>
        <CardDescription>Select your account type to get started</CardDescription>
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
                      className="grid gap-4"
                    >
                      {kycTypeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = field.value === option.value;

                        return (
                          <label
                            key={option.value}
                            htmlFor={option.value}
                            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              className="mt-0.5"
                            />
                            <div
                              className={`flex-shrink-0 mt-0.5 ${
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div
                                className={`font-semibold mb-1 ${
                                  isSelected ? 'text-primary' : 'text-foreground'
                                }`}
                              >
                                {option.label}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
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

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !form.watch('kycType')}
                className="gap-2"
              >
                {isSubmitting ? 'Initializing...' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

