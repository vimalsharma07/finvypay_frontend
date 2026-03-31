import type { CursorPaginationMeta } from '@/lib/types/pagination';

/** Exported for callers that extend meta (e.g. notifications + unreadCount). */
export function coerceCursorMeta(raw: unknown): CursorPaginationMeta | null {
  if (raw == null || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  return {
    itemsPerPage: Number(m.itemsPerPage ?? 20),
    hasNextPage: Boolean(m.hasNextPage),
    hasPreviousPage: Boolean(m.hasPreviousPage),
    nextCursor: (m.nextCursor as string | null) ?? null,
    totalCount: Number(m.totalCount ?? m.totalItems ?? m.total ?? 0),
  };
}

export function extractListRows<T>(raw: unknown): T[] {
  if (raw == null || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as T[];
  if (Array.isArray(r.items)) return r.items as T[];
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as T[];
    if (Array.isArray(d.items)) return d.items as T[];
  }
  return [];
}

function extractMetaFromResponse(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.meta != null) return r.meta;
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>;
    if (d.meta != null) return d.meta;
  }
  return null;
}

/**
 * Normalizes varied backend list shapes ({ data }, { items }, nested data.data) into
 * a single { success, data: rows, meta } envelope for list screens.
 */
export function normalizeToCursorListEnvelope<T>(raw: unknown): {
  success: boolean;
  data: T[];
  meta: CursorPaginationMeta | null;
} {
  const rows = extractListRows<T>(raw);
  const meta = coerceCursorMeta(extractMetaFromResponse(raw));
  const r = raw as Record<string, unknown> | null;
  const success = r == null || r.success !== false;
  return { success, data: rows, meta };
}
