'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getSettlementById, SettlementDetailResponse } from '@/lib/services/admin/settlements';
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

export default function AdminSettlementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const settlementId = params?.id as string | undefined;

  const [data, setData] = useState<SettlementDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!settlementId) return;
    setLoading(true);
    try {
      const response = await getSettlementById(settlementId);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
          } else {
            toast.error('Failed to load settlement detail');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlement detail');
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

  const handleViewPdf = (pdfUrl: string | null) => {
    if (!pdfUrl) {
      toast.error('PDF not available');
      return;
    }
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Details"
              description="Loading settlement information..."
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  if (!data) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Details"
              description="Settlement not found"
              icon={FileText}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-10 text-muted-foreground">No settlement data found</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Details"
            description={`View complete settlement information for Invoice: ${data.invoiceNumber || settlementId || ''}`}
            icon={FileText}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/settlement/all')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settlements
            </Button>
            {data.pdfUrl && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewPdf(data.pdfUrl)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewPdf(data.pdfUrl)}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View PDF
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Settlement Information */}
            <Card>
              <CardHeader>
                <CardTitle>Settlement Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Invoice Number</span>
                  <span className="font-medium">{data.invoiceNumber || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Settlement Date</span>
                  <span className="font-medium">
                    {data.settlementDate ? format(new Date(data.settlementDate), DATE_FMT) : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{data.type || '—'}</Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={data.isPaid ? 'success' : 'warning'}>
                    {data.isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paid At</span>
                  <span className="font-medium">
                    {data.paidAt ? format(new Date(data.paidAt), DATE_TIME_FMT) : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Remarks</span>
                  <span className="font-medium text-right">{data.remarks || '—'}</span>
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{data.userName || data.user?.name || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{data.userEmail || data.user?.email || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">KYC Status</span>
                  <Badge variant="outline" className="uppercase">
                    {data.user?.kycStatus || '—'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Period */}
            <Card>
              <CardHeader>
                <CardTitle>Settlement Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">
                    {data.settlementStartDate
                      ? format(new Date(data.settlementStartDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">
                    {data.settlementEndDate
                      ? format(new Date(data.settlementEndDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Disputes Start Date</span>
                  <span className="font-medium">
                    {data.disputesStartDate
                      ? format(new Date(data.disputesStartDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Disputes End Date</span>
                  <span className="font-medium">
                    {data.disputesEndDate
                      ? format(new Date(data.disputesEndDate), DATE_FMT)
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Amounts Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Amounts Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Gross Amount</span>
                  <span className="font-medium">{formatCurrency(data.grossAmountUsd)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(data.totalDeductionsUsd)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Settlement Fee</span>
                  <span className="font-medium">{formatCurrency(data.settlementFeeAmount)}</span>
                </div>
                <div className="flex justify-between gap-4 border-t pt-3">
                  <span className="text-muted-foreground font-semibold">Net Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(data.netAmountUsd)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-semibold">{formatCurrency(data.paidAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Counts */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Counts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Success</span>
                  <span className="font-medium">{formatNumber(data.totalSuccessCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Decline</span>
                  <span className="font-medium">{formatNumber(data.totalDeclineCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Refund</span>
                  <span className="font-medium">{formatNumber(data.totalRefundCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Chargeback</span>
                  <span className="font-medium">{formatNumber(data.totalChargebackCount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Suspicious</span>
                  <span className="font-medium">{formatNumber(data.totalSuspiciousCount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Display to Merchant</span>
                  <Badge variant="outline">{data.isDisplayToMerchant ? 'Yes' : 'No'}</Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">
                    {data.createdAt ? format(new Date(data.createdAt), DATE_TIME_FMT) : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Updated At</span>
                  <span className="font-medium">
                    {data.updatedAt ? format(new Date(data.updatedAt), DATE_TIME_FMT) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settlement Details Table */}
          {data.details && data.details.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Settlement Details by Acquirer Account</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Acquirer Account</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead className="text-right">Success Count</TableHead>
                        <TableHead className="text-right">Success Amount</TableHead>
                        <TableHead className="text-right">Decline Count</TableHead>
                        <TableHead className="text-right">MDR Amount</TableHead>
                        <TableHead className="text-right">Rolling Reserve</TableHead>
                        <TableHead className="text-right">Transaction Fees</TableHead>
                        <TableHead className="text-right">Refund Amount</TableHead>
                        <TableHead className="text-right">Chargeback Amount</TableHead>
                        <TableHead className="text-right">Suspicious Amount</TableHead>
                        <TableHead className="text-right font-semibold">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.acquirerAccountName || detail.merchantAcquirerAccount?.name || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{detail.currency || detail.acquirerCurrency || '—'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(detail.totalSuccessCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.totalSuccessAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(detail.totalDeclineCount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.mdrAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.rollingReserveAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.successTransactionFeeAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.refundTransactionAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.chargebackTransactionAmountUsd)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(detail.suspiciousTransactionAmountUsd)}
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

