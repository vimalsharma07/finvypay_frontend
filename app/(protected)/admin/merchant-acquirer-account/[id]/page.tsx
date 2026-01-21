'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  DollarSign,
  User,
  Calendar,
  Key,
  Settings,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  getMerchantAcquirerAccount,
  MerchantAcquirerAccountDetail,
  GetMerchantAcquirerAccountResponse,
} from '@/lib/services/admin/acquirer-accounts';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';

export default function AdminMerchantAcquirerAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<MerchantAcquirerAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const accountId = params.id as string;

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
  }, [accountId]);

  const getStatusBadgeVariant = (status: number): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 0:
        return 'destructive'; // Rejected
      case 1:
        return 'success'; // Approved
      case 2:
        return 'warning'; // Pending
      case 3:
        return 'info'; // Rates Assigned
      default:
        return 'secondary';
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

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatArray = (arr: string[]): string => {
    return arr.length > 0 ? arr.join(', ') : 'None';
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Merchant Acquirer Account Details"
              description="Loading account details..."
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  if (!account) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Merchant Acquirer Account Details"
              description="Account not found"
            />
          </Toolbar>
        </Container>
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
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Merchant Acquirer Account Details"
            description={`Account: ${account.name} (${account.terminalId})`}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Accounts
          </Button>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                Account Overview
              </CardTitle>
              <CardDescription>
                Basic account information and current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                  <p className="text-sm font-medium">{account.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Terminal ID</label>
                  <p className="text-sm font-mono">{account.terminalId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="text-sm">{account.currencyCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={getStatusBadgeVariant(account.status)} className="mt-1">
                    {getStatusLabel(account.status)}
                  </Badge>
                </div>
              </div>
              {account.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1">{account.description}</p>
                  </div>
                </>
              )}
            </CardContent>
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
                  <p className="text-sm">{account.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{account.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                  <p className="text-sm">{account.user.entityType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                  <Badge variant={account.user.kycStatus === 'approved' ? 'success' : 'warning'}>
                    {account.user.kycStatus}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profile Completed</label>
                  <Badge variant={account.user.isProfileCompleted ? 'success' : 'secondary'}>
                    {account.user.isProfileCompleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Acquirer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5" />
                  Acquirer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Acquirer Name</label>
                  <p className="text-sm font-medium">{account.acquirer.acquirerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="text-sm font-mono">{account.acquirer.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={account.acquirer.status === 'active' ? 'success' : 'secondary'}>
                    {account.acquirer.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Acquirer Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5" />
                  Acquirer Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                  <p className="text-sm">{account.acquirerAccount.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Provider Type</label>
                  <Badge variant="secondary" className="capitalize">
                    {account.acquirerAccount.providerType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Flow Type</label>
                  <Badge variant="outline" className="capitalize">
                    {account.acquirerAccount.flowType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                  <p className="text-sm">{account.acquirerAccount.timezone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Active</label>
                  <Badge variant={account.acquirerAccount.status === 'active' ? 'success' : 'secondary'}>
                    {account.acquirerAccount.status === 'active' ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Rate Structure */}
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
                    <p className="text-sm">{account.rates.base_mdr}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Visa MDR</label>
                    <p className="text-sm">{account.rates.visa_mdr}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Master MDR</label>
                    <p className="text-sm">{account.rates.master_mdr}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Setup Fee</label>
                    <p className="text-sm">{formatCurrency(account.rates.setup_fee)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Refund Fee</label>
                    <p className="text-sm">{formatCurrency(account.rates.refund_fee)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Chargeback Fee</label>
                    <p className="text-sm">{formatCurrency(account.rates.chargeback_fee)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rate Type</label>
                  <Badge variant="outline" className="mt-1">
                    {account.ratesType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Transaction Limits & Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Amount Limits */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Amount Limits</h4>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Min Transaction</label>
                    <p className="text-sm">{formatCurrency(account.acquirerAccount.minTransactionAmount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Max Transaction</label>
                    <p className="text-sm">{formatCurrency(account.acquirerAccount.maxTransactionAmount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Daily Success Amount</label>
                    <p className="text-sm">{formatCurrency(account.acquirerAccount.perDaySuccessAmount)}</p>
                  </div>
                </div>

                {/* Card Limits */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Card Limits</h4>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Daily Cards</label>
                    <p className="text-sm">{account.acquirerAccount.perDayCardLimit}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Weekly Cards</label>
                    <p className="text-sm">{account.acquirerAccount.perWeekCardLimit}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Monthly Cards</label>
                    <p className="text-sm">{account.acquirerAccount.perMonthCardLimit}</p>
                  </div>
                </div>

                {/* Email Limits */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Email Limits</h4>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Daily Emails</label>
                    <p className="text-sm">{account.acquirerAccount.perDayEmailLimit}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Weekly Emails</label>
                    <p className="text-sm">{account.acquirerAccount.perWeekEmailLimit}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Monthly Emails</label>
                    <p className="text-sm">{account.acquirerAccount.perMonthEmailLimit}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Country Restrictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Globe className="size-4" />
                    Allowed Countries
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {account.acquirerAccount.allowedCountries.length > 0 ? (
                      account.acquirerAccount.allowedCountries.map((country) => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No restrictions</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="size-4" />
                    Blocked Countries
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {account.acquirerAccount.blockedCountries.length > 0 ? (
                      account.acquirerAccount.blockedCountries.map((country) => (
                        <Badge key={country} variant="destructive" className="text-xs">
                          {country}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None blocked</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Accepted Card Types */}
              <div>
                <h4 className="font-medium text-sm mb-3">Accepted Card Types</h4>
                <div className="flex flex-wrap gap-2">
                  {account.acquirerAccount.acceptedCardTypes.map((cardType) => (
                    <Badge key={cardType} variant="secondary" className="capitalize">
                      {cardType}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="size-5" />
                Account Settings & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Account</label>
                  <Badge variant={account.isPrimary ? 'success' : 'secondary'} className="mt-1">
                    {account.isPrimary ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Active</label>
                  <Badge variant={account.isActive ? 'success' : 'secondary'} className="mt-1">
                    {account.isActive ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Enabled</label>
                  <Badge variant={account.user.ipEnabled ? 'success' : 'secondary'} className="mt-1">
                    {account.user.ipEnabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">BIN Enabled</label>
                  <Badge variant={account.user.binEnabled ? 'success' : 'secondary'} className="mt-1">
                    {account.user.binEnabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Secret Key (masked) */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Secret Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {account.secretKey.substring(0, 8)}...{account.secretKey.substring(account.secretKey.length - 4)}
                  </code>
                  <Key className="size-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Account Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{new Date(account.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{new Date(account.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
}
