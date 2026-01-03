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
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
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
import { X, Plus } from 'lucide-react';

// Card number validation (basic validation - accepts digits only, 13-19 digits)
const cardNumberRegex = /^\d{13,19}$/;

// Form schema
const addCardSchema = z.object({
  card: z
    .string()
    .min(1, 'Card number is required')
    .regex(cardNumberRegex, 'Please enter a valid card number (13-19 digits)'),
});

type AddCardFormData = z.infer<typeof addCardSchema>;

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (card: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddCardDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddCardDialogProps) {
  const form = useForm<AddCardFormData>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      card: '',
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        card: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: AddCardFormData) => {
    await onSubmit(data.card);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Trusted Card</DialogTitle>
          <DialogDescription>
            Enter the card number to add it to your trusted card list.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Card Number Input */}
              <FormField
                control={form.control}
                name="card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Card Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Card Number"
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
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
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

