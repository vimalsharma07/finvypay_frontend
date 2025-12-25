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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Industry } from '@/lib/services/admin/industries';

// Form schema
const editIndustrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status is required',
  }),
});

type EditIndustryFormData = z.infer<typeof editIndustrySchema>;

interface EditIndustryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  industry: Industry | null;
  onSubmit: (name: string, status: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditIndustryDialog({
  open,
  onOpenChange,
  industry,
  onSubmit,
  isSubmitting = false,
}: EditIndustryDialogProps) {
  const form = useForm<EditIndustryFormData>({
    resolver: zodResolver(editIndustrySchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
    mode: 'onChange',
  });

  // Reset form when dialog opens/closes or industry changes
  useEffect(() => {
    if (open && industry) {
      form.reset({
        name: industry.name,
        status: industry.status as 'active' | 'inactive',
      });
    } else if (!open) {
      form.reset({
        name: '',
        status: 'active',
      });
    }
  }, [open, industry, form]);

  const handleSubmit = async (data: EditIndustryFormData) => {
    await onSubmit(data.name, data.status);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Industry</DialogTitle>
          <DialogDescription>
            Update the industry information below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogBody className="space-y-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter industry name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Industry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

