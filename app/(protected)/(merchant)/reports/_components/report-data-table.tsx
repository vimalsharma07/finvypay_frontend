'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface ReportDataTableProps {
  data: unknown;
  loading: boolean;
  title: string;
  emptyMessage?: string;
}

function isDateLike(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && value.length >= 8;
}

function isAmountKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes('amount') ||
    lower.includes('total') ||
    lower.includes('sum') ||
    lower.includes('price') ||
    lower.includes('rate') ||
    lower.includes('fee')
  );
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

function formatHeader(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ReportDataTable({
  data,
  loading,
  title,
  emptyMessage = 'No data available for the selected date range',
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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{formatHeader(col)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {formatCellValue((row as Record<string, unknown>)[col], col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
