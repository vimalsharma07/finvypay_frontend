/**
 * Cursor pagination — matches backend CursorPaginationMeta
 */
export interface CursorPaginationMeta {
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  /** Total rows matching list filters (from DB COUNT), same as backend */
  totalCount: number;
}

/** Default page size for server-driven lists */
export const DEFAULT_LIST_PAGE_SIZE = 20;

/** Allowed page sizes for list footers (keep in sync across UI) */
export const LIST_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
