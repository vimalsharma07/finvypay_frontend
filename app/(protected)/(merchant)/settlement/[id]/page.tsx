'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserSettlementById,
  getUserSettlementDetails,
  UserSettlementDetail,
  UserSettlementDetailItem,
} from '@/lib/services/user/settlements';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const DATE_FMT = 'yyyy-MM-dd';
const DATE_TIME_FMT = 'yyyy-MM-dd HH:mm';

const formatCurrency = (amount: string | null | undefined) => {
  if (!amount) return '—';
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString();
};

export default function UserSettlementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const settlementId = params?.id as string | undefined;

  const [settlementData, setSettlementData] = useState<UserSettlementDetail | null>(null);
  const [detailsData, setDetailsData] = useState<UserSettlementDetailItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!settlementId) return;
    setLoading(true);
    try {
      // Fetch settlement main data
      const settlementResponse = await getUserSettlementById(settlementId);
      handleApiResponse(settlementResponse, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setSettlementData(res.data);
          } else {
            toast.error('Failed to load settlement detail');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlement detail');
        },
        silent: true,
      });

      // Fetch settlement details (by acquirer account)
      const detailsResponse = await getUserSettlementDetails(settlementId);
      handleApiResponse(detailsResponse, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setDetailsData(res.data);
          }
        },
        onError: (message) => {
          // Silent error for details - it's optional
          console.error('Failed to load settlement details:', message);
        },
        silent: true,
      });
    } catch (error) {
      console.error('Settlement detail fetch error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settlementId]);

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Record"
              description="Loading settlement information..."
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading...
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!settlementData) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Record"
              description="Settlement not found"
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            No settlement data found
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
            title="Settlement Record"
            description={`Invoice ${settlementData.invoiceNumber || settlementId || ''} — full payout breakdown`}
            icon={FileText}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
              Fund desk
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review amounts, period, and per-account settlement lines for this invoice.
            </p>
          </div>

          <div className="flex flex-wrap justify-start items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/settlement/all')}
              className="gap-2 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
            {settlementData.pdfUrl && (
              <Button
                variant="outline"
                className="gap-2 rounded-xl shadow-sm shadow-sky-500/10"
                onClick={() => window.open(settlementData.pdfUrl!, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4" />
                View PDF
              </Button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Settlement Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">{settlementData.invoiceNumber || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Settlement Date</span>
                  <span className="font-medium">
                    {settlementData.settlementDate
                      ? format(new Date(settlementData.settlementDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={settlementData.isPaid ? 'success' : 'warning'}>
                    {settlementData.isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paid At</span>
                  <span className="font-medium">
                    {settlementData.paidAt
                      ? format(new Date(settlementData.paidAt), DATE_TIME_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">
                    {settlementData.createdAt
                      ? format(new Date(settlementData.createdAt), DATE_TIME_FMT)
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Settlement Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {settlementData.settlementStartDate
                      ? format(new Date(settlementData.settlementStartDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">
                    {settlementData.settlementEndDate
                      ? format(new Date(settlementData.settlementEndDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Amounts Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Gross Amount</span>
                  <span className="font-medium">{formatCurrency(settlementData.grossAmountUsd)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(settlementData.totalDeductionsUsd)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Settlement Fee</span>
                  <span className="font-medium">{formatCurrency(settlementData.settlementFeeAmount)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t pt-3">
                  <span className="text-muted-foreground font-semibold">Net Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(settlementData.netAmountUsd)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-semibold">{formatCurrency(settlementData.paidAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Transaction Counts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Success</span>
                  <span className="font-medium">{formatNumber(settlementData.totalSuccessCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Decline</span>
                  <span className="font-medium">{formatNumber(settlementData.totalDeclineCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Refund</span>
                  <span className="font-medium">{formatNumber(settlementData.totalRefundCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Chargeback</span>
                  <span className="font-medium">{formatNumber(settlementData.totalChargebackCount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {detailsData && detailsData.length > 0 && (
            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40 lg:col-span-2">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle>Settlement Details by Acquirer Account</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-xl border border-sky-100 dark:border-sky-900/40">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead className="text-right">Success Count</TableHead>
                        <TableHead className="text-right">Success Amount</TableHead>
                        <TableHead className="text-right">MDR Amount</TableHead>
                        <TableHead className="text-right">Rolling Reserve</TableHead>
                        <TableHead className="text-right">Transaction Fee</TableHead>
                        <TableHead className="text-right font-semibold">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsData.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.acquirerAccountName}
                            {detail.merchantAcquirerAccount?.terminalId && (
                              <div className="text-xs text-muted-foreground">
                                {detail.merchantAcquirerAccount.terminalId}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{detail.currency}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(detail.totalSuccessCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.totalSuccessAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.mdrAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.rollingReserveAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.successTransactionFeeAmount)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(detail.netAmountUsd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </Fragment>
  );
}

