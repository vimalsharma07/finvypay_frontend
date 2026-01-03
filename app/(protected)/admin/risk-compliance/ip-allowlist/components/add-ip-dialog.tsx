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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getUsers, User } from '@/lib/services/admin/users';
import { X, Plus } from 'lucide-react';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// IP address validation regex
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Form schema
const addIpSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  ips: z.string().min(1, 'At least one IP address is required').refine(
    (value) => {
      // Split by newlines, commas, or spaces and filter empty strings
      const ipList = value
        .split(/[\n,]+/)
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0);
      
      if (ipList.length === 0) return false;
      
      // Validate each IP address
      return ipList.every((ip) => ipRegex.test(ip));
    },
    {
      message: 'Please enter valid IP addresses (one per line or comma-separated)',
    }
  ),
});

type AddIpFormData = z.infer<typeof addIpSchema>;

interface AddIpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, ips: string[]) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddIpDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddIpDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const form = useForm<AddIpFormData>({
    resolver: zodResolver(addIpSchema),
    defaultValues: {
      userId: '',
      ips: '',
    },
    mode: 'onChange',
  });

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      form.reset({
        userId: '',
        ips: '',
      });
    }
  }, [open, form]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Fetch users with role "merchant" only
      const response = await getUsers({
        limit: 100,
        page: 1,
        role: 'merchant',
      });
      handleApiResponse(response, {
        onSuccess: (data) => {
          // New format: { success: true, data: [...] }
          if (data && data.success && data.data) {
            setUsers(Array.isArray(data.data) ? data.data : []);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch users');
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (data: AddIpFormData) => {
    // Parse IP addresses from textarea (split by newlines, commas, or spaces)
    const ipList = data.ips
      .split(/[\n,]+/)
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    await onSubmit(data.userId, ipList);
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
          <DialogTitle>Add IP Addresses</DialogTitle>
          <DialogDescription>
            Select a user and enter IP addresses to whitelist (one per line or comma-separated).
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
                          <SelectValue placeholder={loadingUsers ? 'Loading users...' : 'Select a user'} />
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

              {/* IP Addresses - Textarea */}
              <FormField
                control={form.control}
                name="ips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      IP Addresses <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="192.168.1.1&#10;192.168.1.2&#10;10.0.0.1"
                        className="min-h-24 font-mono"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Enter IP addresses, one per line or comma-separated
                    </p>
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
                  {isSubmitting ? 'Adding...' : 'Add IP Addresses'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

