/**
 * Shared utilities for user transaction pages
 */

import { Transaction } from '@/lib/services/user/transaction';

/**
 * Transaction status mapping (API sends numeric status)
 * PENDING = 0, SUCCESS = 1, FAILED = 2, BLOCKED = 3, ABANDONED = 4, REDIRECTED = 5
 */
export function formatTransactionStatus(status: number): {
  label: string;
  variant: 'primary' | 'success' | 'destructive' | 'warning' | 'secondary';
} {
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
 * Format date string as "Jan 5, 2026, 01:53 AM (UTC)"
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
      timeZone: 'UTC',
    });
    return `${formatted} (UTC)`;
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
    const country = transaction.country?.toLowerCase() || '';

    return (
      fullName.includes(query) ||
      userEmail.includes(query) ||
      transactionId.includes(query) ||
      country.includes(query)
    );
  });
}

