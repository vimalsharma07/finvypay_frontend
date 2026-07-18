export const throttle = (
  func: (...args: unknown[]) => void,
  limit: number,
): ((...args: unknown[]) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function (this: unknown, ...args: unknown[]) {
    if (lastRan === null) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (lastFunc !== null) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(
        () => {
          if (Date.now() - (lastRan as number) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - (lastRan as number)),
      );
    }
  };
};

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function uid(): string {
  return (Date.now() + Math.floor(Math.random() * 1000)).toString();
}

export function getInitials(
  name: string | null | undefined,
  count?: number,
): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase());

  return count && count > 0
    ? initials.slice(0, count).join('')
    : initials.join('');
}

export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  if (baseUrl && baseUrl !== '/') {
    return process.env.NEXT_PUBLIC_BASE_PATH + pathname;
  } else {
    return pathname;
  }
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600)
    return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800)
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;

  return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
}

export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(input: Date | string | number): string {
  const date = new Date(input);
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export type GenerateFilterInput = Record<
  string,
  string | number | boolean | string[] | number[] | null | undefined
>;

/**
 * Convert filter form values into a query-friendly object.
 * - drops undefined/null/empty-string
 * - joins arrays into comma-delimited strings
 */
export function generateFilterQuery(filters: GenerateFilterInput) {
  const query: Record<string, string | number | boolean> = {};

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      query[key] = value.join(',');
      return;
    }

    if (value === '') return;

    query[key] = value;
  });

  return query;
}

/** Map advance filter keys to admin transaction API query param names (production & sandbox) */
const ADMIN_TX_FILTER_TO_API: Record<string, string> = {
  user_id: 'userId',
  transaction_id: 'transactionId',
  gateway_id: 'gatewayId',
  order_id: 'orderId',
  email: 'email',
  card_bin: 'cardBin',
  connector: 'connector',
  currency: 'currency',
  status: 'status',
  country: 'country',
  transaction_date_start: 'transactionDateStart',
  transaction_date_end: 'transactionDateEnd',
  refund_date_start: 'refundDateStart',
  refund_date_end: 'refundDateEnd',
  chargeback_date_start: 'chargebackDateStart',
  chargeback_date_end: 'chargebackDateEnd',
  message: 'message',
};

/**
 * Convert advance filter object to admin transaction API query params.
 * Use after generateFilterQuery for admin production/sandbox transaction list.
 * Single date fields (transaction_date, refund_date, chargeback_date) are sent as both Start and End for "on that day".
 */
export function mapAdminTransactionFiltersToApiParams(
  filters: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    // Single date fields: map to both Start and End (handled below)
    if (key === 'transaction_date' || key === 'refund_date' || key === 'chargeback_date') {
      return;
    }
    const apiKey = ADMIN_TX_FILTER_TO_API[key] ?? key;
    params[apiKey] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
  });
  // Single date -> same value for Start and End (filter on that day)
  const dateMap: [string, string, string][] = [
    ['transaction_date', 'transactionDateStart', 'transactionDateEnd'],
    ['refund_date', 'refundDateStart', 'refundDateEnd'],
    ['chargeback_date', 'chargebackDateStart', 'chargebackDateEnd'],
  ];
  dateMap.forEach(([filterKey, startKey, endKey]) => {
    const v = filters[filterKey];
    if (v && String(v).trim() !== '') {
      const dateStr = String(v).trim();
      params[startKey] = dateStr;
      params[endKey] = dateStr;
    }
  });
  return params;
}

/** Map advance filter keys to merchant transaction API query param names (production & sandbox) – per API spec */
const MERCHANT_TX_FILTER_TO_API: Record<string, string> = {
  transaction_id: 'transactionId',
  order_id: 'orderId',
  email: 'email',
  card_bin: 'cardBin',
  connector: 'connector',
  currency: 'currency',
  status: 'status',
  country: 'country',
  message: 'message',
  merchant_profile_id: 'merchant_profile_id',
};

/**
 * Convert advance filter object to merchant transaction API query params.
 * Use after generateFilterQuery for merchant production/sandbox transaction list.
 * Single date transaction_date is sent as transactionDateStart and transactionDateEnd (same day).
 */
export function mapMerchantTransactionFiltersToApiParams(
  filters: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'transaction_date') return; // handled below
    const apiKey = MERCHANT_TX_FILTER_TO_API[key] ?? key;
    params[apiKey] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
  });
  const v = filters['transaction_date'];
  if (v && String(v).trim() !== '') {
    const dateStr = String(v).trim();
    params['transactionDateStart'] = dateStr;
    params['transactionDateEnd'] = dateStr;
  }
  return params;
}

/** Affiliate RP merchant transactions API accepts only these query params for filters */
const AFFILIATE_TX_FILTER_TO_API: Record<string, string> = {
  transaction_id: 'transactionId',
  start_date: 'startDate',
  end_date: 'endDate',
  merchant_id: 'merchant_id',
  status: 'status',
};

/**
 * Convert advance filter object to affiliate RP merchant transaction API query params.
 * Only sends keys accepted by GET /affiliate/transactions/rp-merchants: transactionId, startDate, endDate, merchant_id, status.
 */
export function mapAffiliateTransactionFiltersToApiParams(
  filters: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    const apiKey = AFFILIATE_TX_FILTER_TO_API[key];
    if (!apiKey) return;
    params[apiKey] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
  });
  return params;
}