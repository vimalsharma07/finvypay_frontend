/**
 * Shared utilities for transaction pages
 */

import { Transaction } from '@/lib/services/admin/transaction';
import { DISPLAY_TIMEZONE } from '@/lib/constants/datetime';

export type TransactionStatusOverride = {
  chargebackDate?: string | null;
  refundDate?: string | null;
};

/** Chargeback takes precedence over refund when both dates exist. */
export function getTransactionStatusOverride(
  options?: TransactionStatusOverride
): 'chargeback' | 'refund' | null {
  if (options?.chargebackDate) return 'chargeback';
  if (options?.refundDate) return 'refund';
  return null;
}

/**
 * Transaction status mapping (API sends numeric status)
 * PENDING = 0, SUCCESS = 1, FAILED = 2, BLOCKED = 3, ABANDONED = 4, REDIRECTED = 5
 * chargebackDate / refundDate override the numeric status in the UI.
 */
export function formatTransactionStatus(
  status: number,
  options?: TransactionStatusOverride
): {
  label: string;
  variant: 'primary' | 'success' | 'destructive' | 'warning' | 'secondary';
} {
  const override = getTransactionStatusOverride(options);
  if (override === 'chargeback') {
    return { label: 'Chargeback', variant: 'destructive' };
  }
  if (override === 'refund') {
    return { label: 'Refunded', variant: 'secondary' };
  }

  const statusMap: Record<
    number,
    { label: string; variant: 'primary' | 'success' | 'destructive' | 'warning' | 'secondary' }
  > = {
    0: { label: 'Pending', variant: 'warning' },
    1: { label: 'Success', variant: 'success' },
    2: { label: 'Failed', variant: 'destructive' },
    3: { label: 'Blocked', variant: 'destructive' },
    4: { label: 'Abandoned', variant: 'secondary' },
    5: { label: 'Redirected', variant: 'secondary' },
  };
  return statusMap[status] || { label: `Status ${status}`, variant: 'secondary' as const };
}

/**
 * Format date string as "Jan 5, 2026, 01:53 AM (UTC)" using global DISPLAY_TIMEZONE
 */
export function formatTransactionDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: DISPLAY_TIMEZONE,
    });
    return `${formatted} (${DISPLAY_TIMEZONE})`;
  } catch {
    return dateString;
  }
}

/**
 * Format currency amount to USD format
 */
export function formatTransactionAmount(amount: string): string {
  try {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch {
    return amount;
  }
}

/**
 * Filter transactions by search query
 */
export function filterTransactions(
  transactions: Transaction[],
  searchQuery: string
): Transaction[] {
  if (!searchQuery.trim()) {
    return transactions;
  }

  const query = searchQuery.toLowerCase();
  return transactions.filter((transaction) => {
    const fullName = `${transaction.firstName} ${transaction.lastName}`.toLowerCase();
    const userEmail = transaction.email?.toLowerCase() || '';
    const transactionId = transaction.transactionId?.toLowerCase() || '';
    const merchantName = transaction.user?.name?.toLowerCase() || '';
    const merchantEmail = transaction.user?.email?.toLowerCase() || '';
    const gatewayId = transaction.gatewayId?.toLowerCase() || '';
    const country = transaction.country?.toLowerCase() || '';

    return (
      fullName.includes(query) ||
      userEmail.includes(query) ||
      transactionId.includes(query) ||
      merchantName.includes(query) ||
      merchantEmail.includes(query) ||
      gatewayId.includes(query) ||
      country.includes(query)
    );
  });
}

