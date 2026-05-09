'use client';

import { useEffect, useState } from 'react';
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
import { getAllMerchantsPaginated, User } from '@/lib/services/admin/users';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Card number validation (basic validation - accepts digits only, 13-19 digits)
const cardNumberRegex = /^\d{13,19}$/;

// Form schema
const addCardSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  card: z
    .string()
    .min(1, 'Card number is required')
    .regex(cardNumberRegex, 'Please enter a valid card number (13-19 digits)'),
});

type AddCardFormData = z.infer<typeof addCardSchema>;

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, card: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddCardDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddCardDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const form = useForm<AddCardFormData>({
    resolver: zodResolver(addCardSchema),
    defaultValues: {
      userId: '',
      card: '',
    },
    mode: 'onChange',
  });

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      form.reset({
        userId: '',
        card: '',
      });
    }
  }, [open, form]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const rows = await getAllMerchantsPaginated({ role: 'merchant' });
      setUsers(rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (data: AddCardFormData) => {
    await onSubmit(data.userId, data.card);
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
          <DialogTitle>Add Trusted Card</DialogTitle>
          <DialogDescription>
            Select a user and enter the card number to trusted card list.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* User Selection */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      User <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || loadingUsers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select a User'} />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Card Number Input */}
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
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting || loadingUsers}>
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

