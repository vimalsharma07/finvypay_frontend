'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantCascadingById,
  deleteUserMerchantCascading,
  UserCascadingRule,
} from '@/lib/services/user/cascading';

export default function CascadingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cascadingId = params.id as string;

  const [cascading, setCascading] = useState<UserCascadingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCascadingDetail = async () => {
      if (!cascadingId) return;

      setLoading(true);
      try {
        const response = await getUserMerchantCascadingById(cascadingId);

        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              setCascading(data.data);
            } else {
              toast.error('Cascading rule not found');
              router.push('/cascading');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load cascading rule details');
            router.push('/cascading');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        router.push('/cascading');
      } finally {
        setLoading(false);
      }
    };

    fetchCascadingDetail();
  }, [cascadingId, router]);

  const handleDelete = async () => {
    if (!cascading) return;

    try {
      const response = await deleteUserMerchantCascading(cascading.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Cascading rule deleted successfully');
          router.push('/cascading');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete cascading rule');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <ContentLoader />
          <span>Loading cascading rule details...</span>
        </div>
      </Container>
    );
  }

  if (!cascading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Cascading rule not found</p>
          <Button onClick={() => router.push('/cascading')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cascading Rules
          </Button>
        </div>
      </Container>
    );
  }

  const primaryAccount = cascading.config?.find(
    (item) => item.merchantAcquirerAccountName === 'Primary'
  );
  const fallbackAccount = cascading.config?.find(
    (item) => item.merchantAcquirerAccountName === 'Fallback'
  );

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={cascading.name}
            description="View detailed information about this cascading rule"
            icon={cascading.status ? CheckCircle : XCircle}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.push('/cascading')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/cascading/${cascading.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rule Name
                  </label>
                  <p className="text-lg font-semibold mt-1">{cascading.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cascading Type
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {cascading.type?.toLowerCase().replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={cascading.status ? 'success' : 'secondary'}>
                      {cascading.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Priority
                  </label>
                  <p className="text-lg font-semibold mt-1">{cascading.priority}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rule ID
                  </label>
                  <p className="text-lg font-semibold mt-1 font-mono">{cascading.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="text-lg font-semibold mt-1 font-mono">{cascading.userId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Merchant Profile ID
                  </label>
                  <p className="text-lg font-semibold mt-1 font-mono">{cascading.merchantProfileId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created By Admin
                  </label>
                  <div className="mt-1">
                    <Badge variant={cascading.byAdmin ? 'success' : 'secondary'}>
                      {cascading.byAdmin ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Connector ID
                  </label>
                  <p className="text-lg font-semibold mt-1 font-mono">{cascading.connectorId || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-sm mt-1">
                    {cascading.createdAt
                      ? new Date(cascading.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </label>
                  <p className="text-sm mt-1">
                    {cascading.updatedAt
                      ? new Date(cascading.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                {cascading.availedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Availed At
                    </label>
                    <p className="text-sm mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(cascading.availedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Account Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Primary Account
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Account ID</span>
                        <Badge variant="primary">
                          {primaryAccount?.merchantAcquirerAccountId || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Role</span>
                        <Badge variant="outline">
                          {primaryAccount?.merchantAcquirerAccountName || 'Primary'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Fallback Account
                  </label>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Account ID</span>
                        <Badge variant="primary">
                          {fallbackAccount?.merchantAcquirerAccountId || cascading.cascadingFor || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Role</span>
                        <Badge variant="outline">
                          {fallbackAccount?.merchantAcquirerAccountName || 'Fallback'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Cascading For</span>
                        <Badge variant="secondary">
                          {cascading.cascadingFor}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connector Information */}
          {cascading.connector && (
            <Card>
              <CardHeader>
                <CardTitle>Connector Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Connector Name
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {cascading.connector.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Terminal ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {cascading.connector.terminalId || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Acquirer Account ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {cascading.connector.acquirerAccountId}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Currency
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {cascading.connector.currencyCode || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge variant={cascading.connector.isActive ? 'success' : 'secondary'}>
                        {cascading.connector.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Primary Account
                    </label>
                    <div className="mt-1">
                      <Badge variant={cascading.connector.isPrimary ? 'success' : 'secondary'}>
                        {cascading.connector.isPrimary ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rates Type
                    </label>
                    <p className="text-lg font-semibold mt-1 capitalize">
                      {cascading.connector.ratesType?.toLowerCase() || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Acquirer ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {cascading.connector.acquirerId}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      User ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {cascading.connector.userId}
                    </p>
                  </div>
                </div>

                {cascading.connector.description && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="text-sm mt-2 text-muted-foreground bg-gray-50 p-3 rounded-md">
                      {cascading.connector.description}
                    </p>
                  </div>
                )}

                {/* Rates Information */}
                {cascading.connector.rates && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Rate Configuration
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.entries(cascading.connector.rates).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-lg font-semibold mt-1">
                            {value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reasons */}
                {(cascading.connector.adminRejectReason || cascading.connector.merchantRejectReason) && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Rejection Information
                    </label>
                    <div className="space-y-3">
                      {cascading.connector.adminRejectReason && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                          <div className="text-sm font-medium text-red-800">Admin Rejection Reason</div>
                          <div className="text-sm text-red-700 mt-1">
                            {cascading.connector.adminRejectReason}
                          </div>
                        </div>
                      )}
                      {cascading.connector.merchantRejectReason && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                          <div className="text-sm font-medium text-yellow-800">Merchant Rejection Reason</div>
                          <div className="text-sm text-yellow-700 mt-1">
                            {cascading.connector.merchantRejectReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current MID (if available) */}
          {cascading.currentMid && (
            <Card>
              <CardHeader>
                <CardTitle>Current MID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <code className="text-sm font-mono break-all">{cascading.currentMid}</code>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>

      {/* Delete Confirmation Dialog */}
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Cascading Rule"
        message={`Are you sure you want to delete the cascading rule "${cascading.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
