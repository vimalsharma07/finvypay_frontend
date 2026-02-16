'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTable, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { modernTableCardClasses } from '@/app/(protected)/components/table-comp';

export interface ReportDataTableProps {
  data: unknown;
  loading: boolean;
  title: string;
  emptyMessage?: string;
  /** Report slug for column label overrides (e.g. transaction-summary) */
  reportSlug?: string;
}

function isDateLike(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && value.length >= 8;
}

/** Format as currency only for amount fields; count/percentage stay numeric */
function isAmountKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (lower.includes('count') || lower.includes('percentage') || lower.includes('percent')) return false;
  return (
    lower.includes('amount') ||
    lower.includes('price') ||
    lower.includes('rate') ||
    lower.includes('fee')
  );
}

function isNumericColumn(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes('count') ||
    lower.includes('amount') ||
    lower.includes('percent') ||
    lower.includes('percentage') ||
    lower.includes('rate') ||
    lower.includes('fee')
  );
}

/** Short labels for transaction-summary to avoid wrapped headers */
const TRANSACTION_SUMMARY_LABELS: Record<string, string> = {
  currency: 'Currency',
  totaltransactioncount: 'Txns',
  totalsuccesscount: 'Success #',
  totalsuccessamount: 'Success Amt',
  totaldeclinecount: 'Decline #',
  totaldeclineamount: 'Decline Amt',
  totalchargebackcount: 'Chargeback #',
  totalchargebackamount: 'Chargeback Amt',
  totalrefundcount: 'Refund #',
  totalrefundamount: 'Refund Amt',
  totalsuspiciouscount: 'Suspicious #',
  totalsuspiciousamount: 'Suspicious Amt',
  successpercentage: 'Success %',
  declinepercentage: 'Decline %',
};

function getColumnLabel(key: string, reportSlug?: string): string {
  if (reportSlug === 'transaction-summary') {
    const normalized = key.toLowerCase().replace(/_/g, '');
    const short = TRANSACTION_SUMMARY_LABELS[normalized];
    if (short) return short;
  }
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCellValue(value: unknown, key: string): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (isAmountKey(key)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    }
    const lower = key.toLowerCase();
    if (lower.includes('percent')) {
      return `${value.toLocaleString()}%`;
    }
    return value.toLocaleString();
  }
  if (isDateLike(value)) {
    try {
      return format(new Date(value as string), 'MMM dd, yyyy');
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function ReportDataTable({
  data,
  loading,
  title,
  emptyMessage = 'No data available for the selected date range',
  reportSlug,
}: ReportDataTableProps) {
  const { rows, columns } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { rows: [], columns: [] as string[] };
    }
    const first = data[0];
    if (typeof first !== 'object' || first === null) {
      return { rows: [], columns: [] as string[] };
    }
    const cols = Object.keys(first as Record<string, unknown>);
    const rows = data as Record<string, unknown>[];
    return { rows, columns: cols };
  }, [data]);

  if (loading) {
    return (
      <Card className={modernTableCardClasses.card}>
        <CardHeader className={modernTableCardClasses.header}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-center py-12 p-5">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className={modernTableCardClasses.card}>
        <CardHeader className={modernTableCardClasses.header}>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-12 text-center p-5">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={modernTableCardClasses.card}>
      <CardHeader className={modernTableCardClasses.header}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardTable className={modernTableCardClasses.table}>
        <ScrollArea className="w-full">
          <table className="w-full caption-bottom text-foreground text-sm border-collapse">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b bg-muted/40">
                {columns.map((col) => (
                  <TableHead
                    key={col}
                    className={
                      isNumericColumn(col)
                        ? 'text-right font-medium text-foreground whitespace-nowrap py-3 px-4'
                        : 'text-left font-medium text-foreground whitespace-nowrap py-3 px-4'
                    }
                  >
                    {getColumnLabel(col, reportSlug)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 1 ? 'bg-muted/20' : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col}
                      className={
                        isNumericColumn(col)
                          ? 'text-right tabular-nums py-3 px-4'
                          : 'text-left py-3 px-4'
                      }
                    >
                      {formatCellValue((row as Record<string, unknown>)[col], col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardTable>
    </Card>
  );
}
