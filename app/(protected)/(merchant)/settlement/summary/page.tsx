'use client';

import { Fragment, useEffect, useState } from 'react';
import { FileText, CheckCircle2, Clock, DollarSign, AlertCircle, Wallet, TrendingUp } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserSettlementSummary,
  getUserSettlementBalance,
  UserSettlementSummary,
  UserSettlementBalanceData,
} from '@/lib/services/user/settlements';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DATE_FMT = 'yyyy-MM-dd';

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

function SummaryCard({ title, value, description, icon: Icon, variant = 'default' }: SummaryCardProps) {
  const variantConfig = {
    default: {
      card: 'border-border bg-gradient-to-br from-card to-card/95 shadow-sm hover:shadow-lg transition-all duration-300',
      iconBg: 'bg-primary/10 text-primary',
      icon: 'text-primary',
      title: 'text-muted-foreground',
      value: 'text-foreground',
      description: 'text-muted-foreground',
    },
    success: {
      card: 'border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-success/10 shadow-sm hover:shadow-lg transition-all duration-300',
      iconBg: 'bg-success/20 text-success',
      icon: 'text-success',
      title: 'text-success/80',
      value: 'text-success',
      description: 'text-success/70',
    },
    warning: {
      card: 'border-warning/30 bg-gradient-to-br from-warning/10 via-warning/5 to-warning/10 shadow-sm hover:shadow-lg transition-all duration-300',
      iconBg: 'bg-warning/20 text-warning',
      icon: 'text-warning',
      title: 'text-warning/80',
      value: 'text-warning',
      description: 'text-warning/70',
    },
    info: {
      card: 'border-info/30 bg-gradient-to-br from-info/10 via-info/5 to-info/10 shadow-sm hover:shadow-lg transition-all duration-300',
      iconBg: 'bg-info/20 text-info',
      icon: 'text-info',
      title: 'text-info/80',
      value: 'text-info',
      description: 'text-info/70',
    },
  };

  const config = variantConfig[variant];

  return (
    <Card className={`${config.card} relative overflow-hidden`}>
      {/* Decorative background element */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${config.iconBg} rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className={`text-sm font-medium ${config.title}`}>{title}</CardTitle>
        <div className={`${config.iconBg} rounded-lg p-2.5 shadow-sm`}>
          <Icon className={`h-5 w-5 ${config.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-3xl font-bold ${config.value} mb-1`}>{value}</div>
        {description && (
          <p className={`text-xs ${config.description} font-medium`}>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function UserSettlementSummaryPage() {
  const [summary, setSummary] = useState<UserSettlementSummary | null>(null);
  const [balance, setBalance] = useState<UserSettlementBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch settlement summary
      const summaryResponse = await getUserSettlementSummary();
      handleApiResponse(summaryResponse, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setSummary(res.data);
          } else {
            toast.error('Invalid response structure while loading settlement summary');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlement summary');
        },
        silent: true,
      });

      // Fetch current balance
      const balanceResponse = await getUserSettlementBalance();
      handleApiResponse(balanceResponse, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setBalance(res.data);
          }
        },
        onError: (message) => {
          // Silent error for balance - it's optional
          console.error('Failed to load balance:', message);
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching settlement data');
      console.error('Settlement data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Summary"
              description="Overview of settlement statistics and financial summary"
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 bg-muted rounded mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!summary) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Summary"
              description="Overview of settlement statistics and financial summary"
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-12 text-muted-foreground">
            No settlement summary data available
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Summary"
            description="Overview of settlement statistics and financial summary"
            icon={FileText}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          {/* Current Balance Card - Prominent Display */}
          {balance && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-primary/90">Current Balance</CardTitle>
                    <p className="text-sm text-primary/70 mt-1">Last updated: {balance.lastUpdated ? format(new Date(balance.lastUpdated), DATE_FMT) : '—'}</p>
                  </div>
                  <div className="bg-primary/20 text-primary rounded-lg p-3 shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatCurrency(balance.currentBalance)}
                    </div>
                    <Badge
                      variant={balance.isPayoutPending ? 'warning' : 'success'}
                      className="px-3 py-1 text-xs font-semibold"
                    >
                      {balance.isPayoutPending ? 'Payout Pending' : 'Available'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settlement Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard
              title="Total Settlements"
              value={summary.totalSettlements.toLocaleString()}
              description="All settlement records"
              icon={FileText}
              variant="info"
            />
            <SummaryCard
              title="Paid Settlements"
              value={summary.paidSettlements.toLocaleString()}
              description="Completed payments"
              icon={CheckCircle2}
              variant="success"
            />
            <SummaryCard
              title="Pending Settlements"
              value={summary.pendingSettlements.toLocaleString()}
              description="Awaiting payment"
              icon={Clock}
              variant="warning"
            />
            <SummaryCard
              title="Total Paid Amount"
              value={formatCurrency(summary.totalPaidAmount)}
              description="Sum of all paid settlements"
              icon={DollarSign}
              variant="success"
            />
            <SummaryCard
              title="Total Pending Amount"
              value={formatCurrency(summary.totalPendingAmount)}
              description="Sum of all pending settlements"
              icon={AlertCircle}
              variant="warning"
            />
          </div>
        </div>
      </Container>
    </Fragment>
  );
}

