/**
 * Shared report utilities
 * Used by both Admin and Merchant report components
 */

/** Flatten nested merchant-transaction-response structure into table rows */
export function flattenMerchantTransactionResponse(
  obj: Record<string, unknown>
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const walk = (o: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(o)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'id' in item) {
            rows.push({ ...item, response: key });
          }
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        walk(value as Record<string, unknown>);
      }
    }
  };
  walk(obj);
  return rows;
}

/** Normalize API response data for table display */
export function normalizeReportData(
  raw: unknown,
  slug: string
): unknown {
  if (raw === undefined || raw === null) return [];
  if (
    slug === 'merchant-transaction-response' &&
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw)
  ) {
    return flattenMerchantTransactionResponse(raw as Record<string, unknown>);
  }
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
}
