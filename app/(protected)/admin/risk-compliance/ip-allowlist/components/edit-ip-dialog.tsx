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
import { IpWhitelist } from '@/lib/services/admin/ip-whitelist';

// Form schema
const editIpSchema = z.object({
  ip: z.string().min(1, 'IP address is required').regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Please enter a valid IP address'
  ),
});

type EditIpFormData = z.infer<typeof editIpSchema>;

interface EditIpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipWhitelist: IpWhitelist | null;
  onSubmit: (id: string, ip: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditIpDialog({
  open,
  onOpenChange,
  ipWhitelist,
  onSubmit,
  isSubmitting = false,
}: EditIpDialogProps) {
  const form = useForm<EditIpFormData>({
    resolver: zodResolver(editIpSchema),
    defaultValues: {
      ip: '',
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes or ipWhitelist changes
  useEffect(() => {
    if (open && ipWhitelist) {
      form.reset({
        ip: ipWhitelist.ip || '',
      });
    }
  }, [open, ipWhitelist, form]);

  const handleSubmit = async (data: EditIpFormData) => {
    if (!ipWhitelist) return;
    await onSubmit(ipWhitelist.id, data.ip);
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
          <DialogTitle>Edit IP Address</DialogTitle>
          <DialogDescription>
            Update the IP address for this whitelist entry.
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
                  value={ipWhitelist?.user?.name || '-'}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              {/* IP Address - Editable */}
              <FormField
                control={form.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      IP Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 192.168.1.1"
                        {...field}
                        disabled={isSubmitting}
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
                  {isSubmitting ? 'Updating...' : 'Update IP'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

