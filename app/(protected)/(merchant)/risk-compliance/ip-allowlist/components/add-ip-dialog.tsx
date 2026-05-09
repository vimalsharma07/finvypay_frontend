'use client';

import { useState } from 'react';
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
import { Plus, X } from 'lucide-react';

// IP address validation regex
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Form schema
const addIpSchema = z.object({
  ips: z
    .array(
      z.string().min(1, 'IP address is required').refine(
        (ip) => ipRegex.test(ip.trim()),
        { message: 'Invalid IP address format' }
      )
    )
    .min(1, 'At least one IP address is required'),
});

type AddIpFormData = z.infer<typeof addIpSchema>;

interface AddIpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ips: string[]) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddIpDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddIpDialogProps) {
  const form = useForm<AddIpFormData>({
    resolver: zodResolver(addIpSchema),
    defaultValues: {
      ips: [''],
    },
    mode: 'onChange',
  });

  const ipFields = form.watch('ips');

  const handleSubmit = async (data: AddIpFormData) => {
    // Filter out empty IPs and trim
    const validIps = data.ips
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);
    
    await onSubmit(validIps);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      form.reset({ ips: [''] });
    }
    onOpenChange(newOpen);
  };

  const addIpField = () => {
    form.setValue('ips', [...ipFields, '']);
  };

  const removeIpField = (index: number) => {
    if (ipFields.length > 1) {
      const newIps = ipFields.filter((_, i) => i !== index);
      form.setValue('ips', newIps);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add IP Addresses</DialogTitle>
          <DialogDescription>
            Add one or more IP addresses to your allowlist. You can add multiple IPs at once.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {ipFields.map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`ips.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index === 0 ? '' : 'sr-only'}>
                          {index === 0 && (
                            <>
                              IP Addresses <span className="text-destructive">*</span>
                            </>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-1">
                            <Input
                              placeholder="e.g., 192.168.1.1"
                              className="font-mono"
                              disabled={isSubmitting}
                              {...field}
                            />
                            {ipFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => removeIpField(index)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addIpField}
                disabled={isSubmitting}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another IP
              </Button>
            </form>
          </Form>
        </DialogBody>
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
          <Button
            type="button"
            variant="primary"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : 'Add IP Addresses'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

