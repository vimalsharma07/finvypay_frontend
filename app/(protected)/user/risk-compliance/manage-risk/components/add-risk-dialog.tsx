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
import { getRiskTypes, RiskType } from '@/lib/services/user/risk-management';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form schema
const addRiskSchema = z.object({
  riskType: z.string().min(1, 'Risk Type is required'),
  riskValue: z.string().min(1, 'Risk Value is required'),
});

type AddRiskFormData = z.infer<typeof addRiskSchema>;

interface AddRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (riskType: string, riskValue: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddRiskDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddRiskDialogProps) {
  const [riskTypes, setRiskTypes] = useState<RiskType[]>([]);
  const [loadingRiskTypes, setLoadingRiskTypes] = useState(false);

  const form = useForm<AddRiskFormData>({
    resolver: zodResolver(addRiskSchema),
    defaultValues: {
      riskType: '',
      riskValue: '',
    },
    mode: 'onChange',
  });

  // Watch riskType to update placeholder dynamically
  const selectedRiskType = form.watch('riskType');
  
  // Get the selected risk type description for placeholder
  const selectedRiskTypeDescription = riskTypes.find(
    (type) => type.value === selectedRiskType
  )?.description || 'Enter risk value';

  // Fetch risk types when dialog opens
  useEffect(() => {
    if (open) {
      fetchRiskTypes();
      form.reset({
        riskType: '',
        riskValue: '',
      });
    }
  }, [open, form]);

  const fetchRiskTypes = async () => {
    setLoadingRiskTypes(true);
    try {
      const response = await getRiskTypes();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setRiskTypes(data.data.riskTypes || []);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch risk types');
        },
      });
    } catch (error) {
      console.error('Error fetching risk types:', error);
      toast.error('Failed to fetch risk types');
    } finally {
      setLoadingRiskTypes(false);
    }
  };

  const handleSubmit = async (data: AddRiskFormData) => {
    await onSubmit(data.riskType, data.riskValue);
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
          <DialogTitle>Create Risk</DialogTitle>
          <DialogDescription>
            Select a risk type and enter the risk value to create a new risk management entry.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Risk Type Selection */}
              <FormField
                control={form.control}
                name="riskType"
                render={({ field }) => {
                  const selectedType = riskTypes.find((type) => type.value === field.value);
                  return (
                    <FormItem>
                      <FormLabel>
                        Risk Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting || loadingRiskTypes}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingRiskTypes ? 'Loading risk types...' : 'Select Risk Type'}>
                              {selectedType ? selectedType.value : null}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {riskTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{type.value}</span>
                                  <span className="text-xs text-muted-foreground">{type.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Risk Value Input */}
              <FormField
                control={form.control}
                name="riskValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Risk Value <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={selectedRiskTypeDescription}
                        disabled={isSubmitting}
                        {...field}
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
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting || loadingRiskTypes}
                >
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

