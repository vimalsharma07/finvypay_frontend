/**
 * Maps API `transactionType` to labels (aligns with backend TransactionType enum).
 * CARD=1, CRYPTO=2, UPI=3, APM=4, PAYOUT=5, WALLET=6
 */
const TRANSACTION_TYPE_LABELS: Record<number, string> = {
  1: 'Card',
  2: 'Crypto',
  3: 'UPI',
  4: 'APM',
  5: 'Payout',
  6: 'Wallet',
};

export function formatTransactionTypeDisplay(transactionType: unknown): string | null {
  if (transactionType === null || transactionType === undefined) return null;
  if (typeof transactionType === 'number') {
    return TRANSACTION_TYPE_LABELS[transactionType] ?? `Unknown (${transactionType})`;
  }
  if (typeof transactionType === 'string') {
    const trimmed = transactionType.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isNaN(n) && Number.isInteger(n)) {
      return TRANSACTION_TYPE_LABELS[n] ?? `Unknown (${n})`;
    }
    return trimmed;
  }
  return String(transactionType);
}
