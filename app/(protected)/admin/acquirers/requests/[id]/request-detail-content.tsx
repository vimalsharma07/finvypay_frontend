'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CreditCard, DollarSign, User, Calendar, CheckCircle, X, Clock } from 'lucide-react';
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
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert';
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
import { modernTableCardClasses } from '@/app/(protected)/components/table-comp';

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
          toast.success(`Request for ${request.merchantProfile?.merchantProfileName ?? request.merchant?.name} approved successfully!`);
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
          toast.success(`Request for ${request.merchantProfile?.merchantProfileName ?? request.merchant?.name} rejected successfully!`);
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
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium">Loading request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <Card className={modernTableCardClasses.card}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">Request not found or has been deleted.</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="size-4" />
            Back to Requests
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
        <Button onClick={() => router.back()} variant="outline" className="gap-2">
          <ArrowLeft className="size-4" />
          Back to Requests
        </Button>

        {/* Status and Actions */}
        <Card className={modernTableCardClasses.card}>
          <CardHeader className={modernTableCardClasses.header}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    disabled={updating}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="size-4" />
                    Approve Request
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={updating}
                    variant="destructive"
                    className="gap-2"
                  >
                    <X className="size-4" />
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Merchant Information */}
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <User className="size-5 text-muted-foreground" />
                Merchant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {request.merchantProfile && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-muted-foreground">Merchant Profile</label>
                  <p className="text-sm font-medium">{request.merchantProfile.merchantProfileName}</p>
                </div>
              )}
              {request.merchant && (
                <>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm font-medium">{request.merchant.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{request.merchant.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Entity Type</label>
                    <p className="text-sm">{request.merchant.entityType}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">KYC Status</label>
                    <Badge variant={request.merchant.kycStatus === 'approved' ? 'success' : 'warning'}>
                      {request.merchant.kycStatus}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Acquirer Account Information - only when request has an acquirer account (e.g. after approval) */}
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="size-5 text-muted-foreground" />
                Acquirer Account
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {request.acquirerAccount ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Account Name</label>
                    <p className="text-sm font-medium">{request.acquirerAccount.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Terminal ID</label>
                    <p className="font-mono text-sm">{request.acquirerAccount.terminalId}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Currency</label>
                    <p className="text-sm">{request.acquirerAccount.currencyCode}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={request.acquirerAccount.isActive ? 'success' : 'secondary'}>
                      {request.acquirerAccount.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <Alert variant="warning" appearance="light" size="md" className="border-border">
                  <AlertIcon>
                    <Clock className="size-5" />
                  </AlertIcon>
                  <AlertContent>
                    <AlertTitle className="font-medium">Pending assignment</AlertTitle>
                    <AlertDescription>
                      No acquirer account has been assigned yet. Approve this request to enable an acquirer account for this merchant.
                    </AlertDescription>
                  </AlertContent>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Configuration */}
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CreditCard className="size-5 text-muted-foreground" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-muted-foreground">Processing Volume</label>
                <p className="text-sm font-medium">{request.processingVolume != null ? String(request.processingVolume) : '—'}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-muted-foreground">Accepted Payment Methods</label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {(request.acceptedPaymentMethods ?? []).length > 0 ? (
                    request.acceptedPaymentMethods.map((method) => (
                      <Badge key={method} variant="secondary" className="capitalize">
                        {method}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-muted-foreground">Processing Currencies</label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {(request.processingCurrency ?? []).length > 0 ? (
                    request.processingCurrency.map((currency) => (
                      <Badge key={currency} variant="outline">
                        {currency}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rates Information - only when acquirer account and rates exist */}
          {request.acquirerAccount?.rates && (
            <Card className={modernTableCardClasses.card}>
              <CardHeader className={modernTableCardClasses.header}>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <DollarSign className="size-5 text-muted-foreground" />
                  Rate Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 gap-4">
                  {request.acquirerAccount.rates.base_mdr != null && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">Base MDR</label>
                      <p className="text-sm font-medium">{request.acquirerAccount.rates.base_mdr}%</p>
                    </div>
                  )}
                  {request.acquirerAccount.rates.visa_mdr != null && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">Visa MDR</label>
                      <p className="text-sm font-medium">{request.acquirerAccount.rates.visa_mdr}%</p>
                    </div>
                  )}
                  {request.acquirerAccount.rates.master_mdr != null && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">Master MDR</label>
                      <p className="text-sm font-medium">{request.acquirerAccount.rates.master_mdr}%</p>
                    </div>
                  )}
                  {request.acquirerAccount.rates.setup_fee != null && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-muted-foreground">Setup Fee</label>
                      <p className="text-sm font-medium">{formatCurrency(request.acquirerAccount.rates.setup_fee)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Request Details */}
        <Card className={modernTableCardClasses.card}>
          <CardHeader className={modernTableCardClasses.header}>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="size-5 text-muted-foreground" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm leading-relaxed">{request.description ?? '—'}</p>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <span className="block font-medium text-muted-foreground">Created</span>
                <p className="font-medium">{new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="block font-medium text-muted-foreground">Last updated</span>
                <p className="font-medium">{new Date(request.updatedAt).toLocaleString()}</p>
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
              <strong>{request.merchantProfile?.merchantProfileName ?? request.merchant?.name}</strong>?
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
              <strong>{request.merchantProfile?.merchantProfileName ?? request.merchant?.name}</strong>?
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

