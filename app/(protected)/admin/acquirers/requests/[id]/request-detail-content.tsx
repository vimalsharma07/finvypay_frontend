'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CreditCard, DollarSign, User, Calendar, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  getMerchantAcquirerRequest,
  updateMerchantAcquirerRequestStatus,
  MerchantAcquirerRequest,
  GetMerchantAcquirerRequestResponse,
  UpdateMerchantAcquirerRequestStatusPayload,
} from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export function RequestDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<MerchantAcquirerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const requestId = params.id as string;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return;

      setLoading(true);
      try {
        const response = await getMerchantAcquirerRequest(requestId);
        handleApiResponse<GetMerchantAcquirerRequestResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setRequest(data.data);
            } else {
              toast.error('Failed to fetch request details');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch request details');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch request error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleApproveRequest = async () => {
    if (!request) return;

    setUpdating(true);
    try {
      const payload: UpdateMerchantAcquirerRequestStatusPayload = {
        status: 'approved'
      };

      const response = await updateMerchantAcquirerRequestStatus(request.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${request.merchant.name} approved successfully!`);
          setApproveDialogOpen(false);
          // Update the local state
          setRequest(prev => prev ? { ...prev, status: 'approved' } : null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to approve request');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Approve request error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!request) return;

    setUpdating(true);
    try {
      const payload: UpdateMerchantAcquirerRequestStatusPayload = {
        status: 'rejected'
      };

      const response = await updateMerchantAcquirerRequestStatus(request.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${request.merchant.name} rejected successfully!`);
          setRejectDialogOpen(false);
          // Update the local state
          setRequest(prev => prev ? { ...prev, status: 'rejected' } : null);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to reject request');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reject request error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading...</div>
    );
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Request not found or has been deleted.</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPending = request.status === 'pending';

  return (
    <Fragment>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Requests
        </Button>

        {/* Status and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Request Status
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Created on {new Date(request.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              {isPending && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 size-4" />
                    Approve Request
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={updating}
                    variant="destructive"
                  >
                    <X className="mr-2 size-4" />
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Merchant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Merchant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{request.merchant.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{request.merchant.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                <p className="text-sm">{request.merchant.entityType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                <Badge variant={request.merchant.kycStatus === 'approved' ? 'success' : 'warning'}>
                  {request.merchant.kycStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Acquirer Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Acquirer Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                <p className="text-sm font-medium">{request.acquirerAccount.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Terminal ID</label>
                <p className="text-sm font-mono">{request.acquirerAccount.terminalId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <p className="text-sm">{request.acquirerAccount.currencyCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={request.acquirerAccount.isActive ? 'success' : 'secondary'}>
                  {request.acquirerAccount.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods & Currencies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Accepted Payment Methods</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.acceptedPaymentMethods.map((method) => (
                    <Badge key={method} variant="outline">
                      {method.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Processing Currencies</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.processingCurrency.map((currency) => (
                    <Badge key={currency} variant="outline">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rates Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Rate Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base MDR</label>
                  <p className="text-sm">{request.acquirerAccount.rates.base_mdr}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visa MDR</label>
                  <p className="text-sm">{request.acquirerAccount.rates.visa_mdr}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Master MDR</label>
                  <p className="text-sm">{request.acquirerAccount.rates.master_mdr}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Setup Fee</label>
                  <p className="text-sm">{formatCurrency(request.acquirerAccount.rates.setup_fee)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1">{request.description}</p>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p>{new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Last Updated:</span>
                <p>{new Date(request.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approve Request Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Acquirer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the acquirer request for{' '}
              <strong>{request.merchant.name}</strong>?
              This will enable the acquirer account for this merchant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveRequest}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? 'Approving...' : 'Approve Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Request Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Acquirer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the acquirer request for{' '}
              <strong>{request.merchant.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectRequest}
              disabled={updating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updating ? 'Rejecting...' : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

