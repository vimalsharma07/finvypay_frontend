'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  getMerchantAcquirerAccount,
  updateMerchantAcquirerAccount,
  MerchantAcquirerAccountDetail,
  GetMerchantAcquirerAccountResponse,
  UpdateMerchantAcquirerAccountPayload,
} from '@/lib/services/admin/acquirer-accounts';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  status: z.number().min(0).max(3),
  isActive: z.boolean(),
  rates: z.object({
    base_mdr: z.string().optional(),
    visa_mdr: z.string().optional(),
    setup_fee: z.string().optional(),
    master_mdr: z.string().optional(),
    refund_fee: z.string().optional(),
    flagged_fee: z.string().optional(),
    chargeback_fee: z.string().optional(),
    rolling_reserve: z.string().optional(),
    success_transaction_fee: z.string().optional(),
    declined_transaction_fee: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditMerchantAcquirerAccountContent() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<MerchantAcquirerAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const accountId = params.id as string;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 0,
      isActive: true,
      rates: {
        base_mdr: '',
        visa_mdr: '',
        setup_fee: '',
        master_mdr: '',
        refund_fee: '',
        flagged_fee: '',
        chargeback_fee: '',
        rolling_reserve: '',
        success_transaction_fee: '',
        declined_transaction_fee: '',
      },
    },
  });

  useEffect(() => {
    const fetchAccount = async () => {
      if (!accountId) return;

      setLoading(true);
      try {
        const response = await getMerchantAcquirerAccount(accountId);
        handleApiResponse<GetMerchantAcquirerAccountResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setAccount(data.data);

              form.reset({
                name: data.data.name,
                description: data.data.description || '',
                status: data.data.status,
                isActive: data.data.isActive,
                rates: {
                  base_mdr: data.data.rates?.base_mdr || '',
                  visa_mdr: data.data.rates?.visa_mdr || '',
                  setup_fee: data.data.rates?.setup_fee || '',
                  master_mdr: data.data.rates?.master_mdr || '',
                  refund_fee: data.data.rates?.refund_fee || '',
                  flagged_fee: data.data.rates?.flagged_fee || '',
                  chargeback_fee: data.data.rates?.chargeback_fee || '',
                  rolling_reserve: data.data.rates?.rolling_reserve || '',
                  success_transaction_fee: data.data.rates?.success_transaction_fee || '',
                  declined_transaction_fee: data.data.rates?.declined_transaction_fee || '',
                },
              });
            } else {
              toast.error('Failed to fetch account details');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch account details');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch account error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [accountId, form]);

  const onSubmit = async (data: FormData) => {
    if (!account) return;

    setSaving(true);
    try {
      const payload: UpdateMerchantAcquirerAccountPayload = {
        acquirerId: account.acquirerId,
        acquirerAccountId: account.acquirerAccountId,
        name: account.name,
        description: data.description || '',
        status: data.status,
        isActive: data.isActive,
        rates: data.rates,
      };

      const response = await updateMerchantAcquirerAccount(account.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Merchant acquirer account updated successfully!');
          router.push(`/admin/merchant-acquirer-account/${account.id}`);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update account');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update account error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0:
        return 'Rejected';
      case 1:
        return 'Approved';
      case 2:
        return 'Pending';
      case 3:
        return 'Rates Assigned';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-8">Loading...</div>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Account not found or has been deleted.</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to Account Details
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update the merchant acquirer account details. Changes will be saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter account name"
                          disabled
                          className="bg-muted"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Account name cannot be changed here
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter account description (optional)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional details about this acquirer account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Rejected</SelectItem>
                            <SelectItem value="1">Approved</SelectItem>
                            <SelectItem value="2">Pending</SelectItem>
                            <SelectItem value="3">Rates Assigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current status: {getStatusLabel(field.value)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Enable or disable this acquirer account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6 pt-6 border-t">
                  <div>
                    <h3 className="text-lg font-medium">Rate Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure the fee structure for this acquirer account
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="rates.base_mdr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base MDR (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Base Merchant Discount Rate percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.visa_mdr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa MDR (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Visa card Merchant Discount Rate percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.master_mdr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Master MDR (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Mastercard Merchant Discount Rate percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.setup_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setup Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            One-time setup fee amount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.refund_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refund Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee charged per refund transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.chargeback_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chargeback Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee charged per chargeback
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.rolling_reserve"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rolling Reserve (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage held as rolling reserve
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.success_transaction_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Success Transaction Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee per successful transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.declined_transaction_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Declined Transaction Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee per declined transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rates.flagged_fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Flagged Fee ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Fee for flagged transactions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-1 size-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Account Details</CardTitle>
            <CardDescription>
              Reference information for the account being edited
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Terminal ID:</span>
                <p className="font-mono">{account.terminalId}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Currency:</span>
                <p>{account.currencyCode}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Rate Type:</span>
                <p>{account.ratesType}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Merchant:</span>
                <p>{account.user.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Merchant Email:</span>
                <p>{account.user.email}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Acquirer:</span>
                <p>{account.acquirer.acquirerName}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Acquirer ID:</span>
                <p className="font-mono">{account.acquirerId}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Acquirer Account ID:</span>
                <p className="font-mono">{account.acquirerAccountId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

