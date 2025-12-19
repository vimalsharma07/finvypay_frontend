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
import { CardWhitelist } from '@/lib/services/admin/card-whitelist';

// Card number validation (basic validation - accepts digits only, 13-19 digits)
const cardNumberRegex = /^\d{13,19}$/;

// Form schema
const editCardSchema = z.object({
  card: z
    .string()
    .min(1, 'Card number is required')
    .regex(cardNumberRegex, 'Please enter a valid card number (13-19 digits)'),
});

type EditCardFormData = z.infer<typeof editCardSchema>;

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardWhitelist: CardWhitelist | null;
  onSubmit: (id: string, card: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditCardDialog({
  open,
  onOpenChange,
  cardWhitelist,
  onSubmit,
  isSubmitting = false,
}: EditCardDialogProps) {
  const form = useForm<EditCardFormData>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      card: '',
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes or cardWhitelist changes
  useEffect(() => {
    if (open && cardWhitelist) {
      form.reset({
        card: cardWhitelist.card || '',
      });
    }
  }, [open, cardWhitelist, form]);

  const handleSubmit = async (data: EditCardFormData) => {
    if (!cardWhitelist) return;
    await onSubmit(cardWhitelist.id, data.card);
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
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the card number for this whitelist entry.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* User Name - Non-editable */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  User Name
                </label>
                <Input
                  value={cardWhitelist?.user?.name || '-'}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              {/* Card Number - Editable */}
              <FormField
                control={form.control}
                name="card"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Card <span className="text-destructive">*</span>
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
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

