'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { CountryCodeSelector } from './country-code-selector';
import { AddDirectorPayload, UpdateDirectorPayload, Director } from '@/lib/services/user/onboarding';

const directorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  countryCodeId: z.number().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required').max(50, 'Phone number is too long'),
  address: z.string().min(1, 'Address is required'),
});

type DirectorFormData = z.infer<typeof directorSchema>;

interface DirectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddDirectorPayload | UpdateDirectorPayload) => Promise<void>;
  director?: Director | null;
  isSubmitting?: boolean;
}

export function DirectorFormDialog({
  open,
  onOpenChange,
  onSubmit,
  director,
  isSubmitting = false,
}: DirectorFormDialogProps) {
  const isEditMode = !!director;

  const form = useForm<DirectorFormData>({
    resolver: zodResolver(directorSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCodeId: undefined as any,
      phoneNumber: '',
      address: '',
    },
    mode: 'onChange',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (director && open) {
      form.reset({
        name: director.name || '',
        email: director.email || '',
        countryCodeId: director.countryCodeId || (undefined as any),
        phoneNumber: director.phoneNumber || '',
        address: director.address || '',
      });
    } else if (!director && open) {
      form.reset({
        name: '',
        email: '',
        countryCodeId: undefined as any,
        phoneNumber: '',
        address: '',
      });
    }
  }, [director, open, form]);

  const handleSubmit = async (data: DirectorFormData) => {
    if (isEditMode) {
      // For edit mode, convert to UpdateDirectorPayload
      const updatePayload: UpdateDirectorPayload = {
        name: data.name,
        email: data.email,
        countryCodeId: data.countryCodeId,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
      await onSubmit(updatePayload);
    } else {
      // For add mode, use as AddDirectorPayload
      await onSubmit(data);
    }
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Director' : 'Add Director'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter director name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="Enter email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="countryCodeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code *</FormLabel>
                    <FormControl>
                      <CountryCodeSelector
                        value={field.value}
                        onChange={field.onChange}
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

