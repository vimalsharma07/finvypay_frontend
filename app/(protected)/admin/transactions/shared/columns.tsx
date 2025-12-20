/**
 * Shared column definitions for transaction tables
 */

import { ColumnDef } from '@tanstack/react-table';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/services/admin/transaction';
import {
  formatTransactionStatus,
  formatTransactionDate,
  formatTransactionAmount,
} from './utils';
import { TransactionActionMenu } from './transaction-action-menu';

/**
 * Get transaction table columns
 */
export function getTransactionColumns(
  onWebhookLogs?: (transaction: Transaction) => void,
  onProviderLogs?: (transaction: Transaction) => void,
  onTransactionLogs?: (transaction: Transaction) => void,
  onViewDetails?: (transaction: Transaction) => void,
  showDisabledActions: boolean = true, // Default to true for production
  onChargeback?: (transaction: Transaction) => void,
  onRefund?: (transaction: Transaction) => void,
  onSuspicious?: (transaction: Transaction) => void
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
      size: 180, // Transaction IDs like "TXN-20251220-871A07"
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
      size: 90, // 2-letter country codes
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
      size: 110, // Gateway IDs like "GW-82"
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
      size: 140, // Currency formatted amounts
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
      size: 110, // Status badges
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
      size: 220, // Name + email on two lines
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
      size: 180, // Formatted date/time
      minSize: 160,
    },
    {
      id: 'merchantUser',
      accessorFn: (row) => row.user?.name || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant User" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.user?.name || '-'}
          </div>
        );
      },
      size: 160, // Merchant user names
      minSize: 140,
    },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <TransactionActionMenu
            transaction={row.original}
            onWebhookLogs={onWebhookLogs}
            onProviderLogs={onProviderLogs}
            onTransactionLogs={onTransactionLogs}
            onChargeback={onChargeback}
            onRefund={onRefund}
            onSuspicious={onSuspicious}
            showDisabledActions={showDisabledActions}
          />
        ),
        enableSorting: false,
        size: 80, // Three dots button
        minSize: 70,
      },
  ];
}

