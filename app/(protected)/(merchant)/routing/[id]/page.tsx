'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock, Route, Settings } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentLoader } from '@/components/common/content-loader';
import { ConfirmComp } from '../../../components/confirm-comp';
import { toast } from 'sonner';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserMerchantRoutingById,
  deleteUserMerchantRouting,
  UserRouteRule,
} from '@/lib/services/user/routing';

export default function RoutingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routingId = params.id as string;

  const [routing, setRouting] = useState<UserRouteRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRoutingDetail = async () => {
      if (!routingId) return;

      setLoading(true);
      try {
        const response = await getUserMerchantRoutingById(routingId);

        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data.success && data.data) {
              setRouting(data.data);
            } else {
              toast.error('Routing rule not found');
              router.push('/routing');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load routing rule details');
            router.push('/routing');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        router.push('/routing');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutingDetail();
  }, [routingId, router]);

  const handleDelete = async () => {
    if (!routing) return;

    try {
      const response = await deleteUserMerchantRouting(routing.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Routing rule deleted successfully');
          router.push('/routing');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete routing rule');
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
          <span>Loading routing rule details...</span>
        </div>
      </Container>
    );
  }

  if (!routing) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Routing rule not found</p>
          <Button onClick={() => router.push('/routing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Routing Rules
          </Button>
        </div>
      </Container>
    );
  }

  const getRoutingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CARD: 'Card Payments',
      BANK_TRANSFER: 'Bank Transfer',
      CRYPTO: 'Cryptocurrency',
      WALLET: 'Digital Wallet',
    };
    return types[type] || type;
  };

  const getOperatorLabel = (operator: string) => {
    const operators: Record<string, string> = {
      '>=': 'Greater than or equal (>=)',
      '<=': 'Less than or equal (<=)',
      '>': 'Greater than (>)',
      '<': 'Less than (<)',
      '==': 'Equal (==)',
      '!=': 'Not equal (!=)',
    };
    return operators[operator] || operator;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      amount: 'Transaction Amount',
      currency: 'Currency',
      country: 'Country',
      card_type: 'Card Type',
      payment_method: 'Payment Method',
    };
    return categories[category] || category;
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={routing.name}
            description="View detailed information about this routing rule"
            icon={routing.status ? CheckCircle : XCircle}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.push('/routing')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/routing/${routing.id}/edit`)}
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
                <Route className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rule Name
                  </label>
                  <p className="text-lg font-semibold mt-1">{routing.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Routing Type
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {getRoutingTypeLabel(routing.routingFor)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={routing.status ? 'success' : 'secondary'}>
                      {routing.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {routing.priority !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Priority
                    </label>
                    <p className="text-lg font-semibold mt-1">{routing.priority}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Rule ID
                  </label>
                  <p className="text-lg font-semibold mt-1 font-mono">{routing.id}</p>
                </div>

                {routing.userId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      User ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">{routing.userId}</p>
                  </div>
                )}

                {routing.merchantProfileId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Merchant Profile ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">{routing.merchantProfileId}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Split Enable
                  </label>
                  <div className="mt-1">
                    <Badge variant={routing.splitEnable ? 'success' : 'secondary'}>
                      {routing.splitEnable ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                {routing.isCascade !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Cascade
                    </label>
                    <div className="mt-1">
                      <Badge variant={routing.isCascade ? 'success' : 'secondary'}>
                        {routing.isCascade ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                )}

                {routing.byAdmin !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created By Admin
                    </label>
                    <div className="mt-1">
                      <Badge variant={routing.byAdmin ? 'success' : 'secondary'}>
                        {routing.byAdmin ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                )}

                {routing.connectorId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Connector ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">{routing.connectorId}</p>
                  </div>
                )}

                {routing.viewRoute && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      View Route
                    </label>
                    <p className="text-sm mt-1 font-medium">{routing.viewRoute}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-sm mt-1">
                    {routing.createdAt
                      ? new Date(routing.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </label>
                  <p className="text-sm mt-1">
                    {routing.updatedAt
                      ? new Date(routing.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acquirer Account / Connector Information */}
          {routing.merchantConnector && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Acquirer Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Name
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {routing.merchantConnector.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account ID
                    </label>
                    <p className="text-lg font-semibold mt-1 font-mono">
                      {routing.merchantConnector.id || 'N/A'}
                    </p>
                  </div>

                  {routing.merchantConnector.terminalId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Terminal ID
                      </label>
                      <p className="text-lg font-semibold mt-1 font-mono">
                        {routing.merchantConnector.terminalId}
                      </p>
                    </div>
                  )}

                  {routing.merchantConnector.currencyCode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Currency
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {routing.merchantConnector.currencyCode}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {routing.merchantConnector.acquirerId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Acquirer ID
                      </label>
                      <p className="text-lg font-semibold mt-1 font-mono">
                        {routing.merchantConnector.acquirerId}
                      </p>
                    </div>
                  )}

                  {routing.merchantConnector.acquirerAccountId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Acquirer Account ID
                      </label>
                      <p className="text-lg font-semibold mt-1 font-mono">
                        {routing.merchantConnector.acquirerAccountId}
                      </p>
                    </div>
                  )}

                  {routing.merchantConnector.description && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <p className="text-sm mt-1">{routing.merchantConnector.description}</p>
                    </div>
                  )}

                  {routing.merchantConnector.status !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Status
                      </label>
                      <div className="mt-1">
                        <Badge variant={routing.merchantConnector.status === 1 ? 'success' : 'secondary'}>
                          {routing.merchantConnector.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {routing.merchantConnector.isPrimary !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Primary Account
                      </label>
                      <div className="mt-1">
                        <Badge variant={routing.merchantConnector.isPrimary ? 'primary' : 'secondary'}>
                          {routing.merchantConnector.isPrimary ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {routing.merchantConnector.isActive !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Is Active
                      </label>
                      <div className="mt-1">
                        <Badge variant={routing.merchantConnector.isActive ? 'success' : 'secondary'}>
                          {routing.merchantConnector.isActive ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Rules */}
          {routing.config && Array.isArray(routing.config) && routing.config.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routing.config.map((rule, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-medium text-sm">Rule #{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Category
                          </label>
                          <p className="text-sm font-semibold mt-1">
                            {getCategoryLabel(rule.category)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Operator
                          </label>
                          <p className="text-sm font-semibold mt-1">
                            {getOperatorLabel(rule.operator)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Value
                          </label>
                          <p className="text-sm font-semibold mt-1">
                            {rule.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Split Configuration */}
          {routing.splitEnable && (
            <Card>
              <CardHeader>
                <CardTitle>Split Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Split Enable
                    </label>
                    <div className="mt-1">
                      <Badge variant="success">Enabled</Badge>
                    </div>
                  </div>
                  {routing.splitType && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Split Type
                      </label>
                      <p className="text-sm font-semibold mt-1">{routing.splitType}</p>
                    </div>
                  )}
                  {routing.splitConfig && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Split Configuration
                      </label>
                      <pre className="text-xs mt-1 p-3 bg-gray-50 border rounded overflow-auto">
                        {JSON.stringify(routing.splitConfig, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>

      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Routing Rule"
        message={`Are you sure you want to delete the routing rule "${routing.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

