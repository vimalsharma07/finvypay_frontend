/**
 * User transaction column definitions
 * Excludes merchant user and action columns
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/services/user/transaction';
import {
  formatTransactionStatus,
  formatTransactionDate,
  formatTransactionAmount,
} from './utils';

/**
 * Get user transaction table columns (without merchant user and action columns)
 */
export function getTransactionColumns(
  onViewDetails?: (transaction: Transaction) => void
): ColumnDef<Transaction>[] {
  return [
    {
      id: 'transactionId',
      accessorKey: 'transactionId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction ID" />
      ),
      cell: ({ row }) => {
        return (
          <button
            onClick={() => onViewDetails?.(row.original)}
            className="font-mono text-sm text-primary cursor-pointer"
          >
            {row.original.transactionId}
          </button>
        );
      },
      size: 180,
      minSize: 150,
    },
    {
      id: 'country',
      accessorKey: 'country',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-mono">
            {row.original.country}
          </Badge>
        );
      },
      size: 90,
      minSize: 80,
    },
    {
      id: 'gatewayId',
      accessorKey: 'gatewayId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Gateway" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.gatewayId}
          </div>
        );
      },
      size: 110,
      minSize: 100,
    },
    {
      id: 'amountInUsd',
      accessorKey: 'amountInUsd',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Amount (USD)" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatTransactionAmount(row.original.amountInUsd)}
          </div>
        );
      },
      size: 140,
      minSize: 120,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const statusInfo = formatTransactionStatus(row.original.status);
        return (
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        );
      },
      size: 110,
      minSize: 100,
    },
    {
      id: 'user',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.firstName} ${row.original.lastName}`;
        return (
          <div className="flex flex-col">
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        );
      },
      size: 220,
      minSize: 180,
    },
    {
      id: 'transactionDate',
      accessorKey: 'transactionDate',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Transaction Date" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {formatTransactionDate(row.original.transactionDate)}
          </div>
        );
      },
      size: 180,
      minSize: 160,
    },
  ];
}

