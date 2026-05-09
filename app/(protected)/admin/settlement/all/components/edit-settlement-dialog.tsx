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
  FormDescription,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Settlement } from '@/lib/services/admin/settlements';
import { X, Save } from 'lucide-react';

// Form schema
const editSettlementSchema = z.object({
  isPaid: z.boolean().optional(),
  isDisplayToMerchant: z.boolean().optional(),
  remarks: z.string().optional(),
});

type EditSettlementFormData = z.infer<typeof editSettlementSchema>;

interface EditSettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlement: Settlement | null;
  onSubmit: (id: string, data: EditSettlementFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditSettlementDialog({
  open,
  onOpenChange,
  settlement,
  onSubmit,
  isSubmitting = false,
}: EditSettlementDialogProps) {
  const form = useForm<EditSettlementFormData>({
    resolver: zodResolver(editSettlementSchema),
    defaultValues: {
      isPaid: false,
      isDisplayToMerchant: false,
      remarks: '',
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes or settlement changes
  useEffect(() => {
    if (open && settlement) {
      form.reset({
        isPaid: settlement.isPaid ?? false,
        isDisplayToMerchant: settlement.isDisplayToMerchant ?? false,
        remarks: settlement.remarks || '',
      });
    }
  }, [open, settlement, form]);

  const handleSubmit = async (data: EditSettlementFormData) => {
    if (!settlement) return;
    await onSubmit(settlement.id, data);
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
          <DialogTitle>Edit Settlement</DialogTitle>
          <DialogDescription>
            Update settlement status and information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Invoice Number - Read-only display */}
              {settlement && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Invoice Number
                  </label>
                  <div className="px-3 py-2 text-sm bg-muted rounded-md">
                    {settlement.invoiceNumber || '—'}
                  </div>
                </div>
              )}

              {/* Is Paid Checkbox */}
              <FormField
                control={form.control}
                name="isPaid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Mark as Paid
                      </FormLabel>
                      <FormDescription>
                        Check this box to mark the settlement as paid.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Is Display to Merchant Checkbox */}
              <FormField
                control={form.control}
                name="isDisplayToMerchant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Display to Merchant
                      </FormLabel>
                      <FormDescription>
                        Make this settlement visible to the merchant in their dashboard.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Remarks Textarea */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter remarks or notes about this settlement..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any additional notes or comments about this settlement.
                    </FormDescription>
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
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-1" />
                  {isSubmitting ? 'Updating...' : 'Update Settlement'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

