'use client';

import { useCallback, useState } from 'react';

/**
 * Stack of cursors: [undefined, c1, c2, ...] — current request uses last entry.
 */
export function useCursorPagination() {
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);

  const requestCursor =
    cursorHistory[cursorHistory.length - 1] ?? undefined;

  const reset = useCallback(() => {
    setCursorHistory([undefined]);
  }, []);

  const goNext = useCallback((nextCursor: string | null | undefined) => {
    if (!nextCursor) return;
    setCursorHistory((h) => [...h, nextCursor]);
  }, []);

  const goPrev = useCallback(() => {
    setCursorHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const canGoPrev = cursorHistory.length > 1;

  return {
    requestCursor,
    reset,
    goNext,
    goPrev,
    canGoPrev,
  };
}
