/**
 * Formats API `cardType` (credit/debit enum, card network string, or legacy numeric).
 */
export function formatCardTypeDisplay(cardType: unknown): string | null {
  if (cardType === null || cardType === undefined) return null;
  if (typeof cardType === 'string') {
    const t = cardType.trim();
    if (!t) return null;
    const u = t.toUpperCase();
    if (u === 'VISA') return 'Visa';
    if (u === 'MASTERCARD' || u === 'MASTER') return 'Master';
    if (u === 'AMEX' || u === 'AMERICAN EXPRESS' || u === 'AMERICANEXPRESS') return 'Amex';
    if (u === 'CREDIT' || u === '1') return 'Credit';
    if (u === 'DEBIT' || u === '2') return 'Debit';
    return t
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  if (typeof cardType === 'number') {
    if (cardType === 1) return 'Credit';
    if (cardType === 2) return 'Debit';
    return String(cardType);
  }
  return String(cardType);
}
