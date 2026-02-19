'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Receipt, User, Loader2 } from 'lucide-react';
import { getProductionTransactions as getAdminProductionTransactions } from '@/lib/services/admin/transaction';
import { searchMerchants } from '@/lib/services/admin/users';
import { getProductionTransactions as getMerchantProductionTransactions } from '@/lib/services/user/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import type { Transaction } from '@/lib/services/admin/transaction';
import type { Merchant } from '@/lib/services/admin/users';

const DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;

function formatAmount(amount: string | number | null | undefined): string {
  if (amount == null) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export interface GlobalSearchDialogProps {
  mode: 'admin' | 'merchant';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function GlobalSearchDialog({
  mode,
  open,
  onOpenChange,
  initialQuery = '',
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setTransactions([]);
        if (mode === 'admin') setMerchants([]);
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);

      const searchParams = { search: trimmed, limit: SEARCH_LIMIT };

      if (mode === 'admin') {
        const [txRes, merchantsRes] = await Promise.all([
          getAdminProductionTransactions(searchParams),
          searchMerchants(trimmed, { limit: SEARCH_LIMIT }),
        ]);
        handleApiResponse(txRes, {
          silent: true,
          onSuccess: (data: any) => {
            const list = Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : [];
            setTransactions(list);
          },
          onError: () => setTransactions([]),
        });
        handleApiResponse(merchantsRes, {
          silent: true,
          onSuccess: (data: any) => {
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setMerchants(Array.isArray(list) ? list : []);
          },
          onError: () => setMerchants([]),
        });
      } else {
        const txRes = await getMerchantProductionTransactions(searchParams);
        handleApiResponse(txRes, {
          silent: true,
          onSuccess: (data: any) => {
            const list = Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : [];
            setTransactions(list);
          },
          onError: () => setTransactions([]),
        });
        setMerchants([]);
      }

      setLoading(false);
    },
    [mode]
  );

  useEffect(() => {
    if (open) setQuery(initialQuery);
    if (!open) {
      setTransactions([]);
      setMerchants([]);
      setHasSearched(false);
    }
  }, [initialQuery, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setTransactions([]);
      if (mode === 'admin') setMerchants([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, runSearch]);

  const noResults =
    hasSearched &&
    !loading &&
    query.trim() &&
    transactions.length === 0 &&
    merchants.length === 0;
  const placeholder =
    mode === 'admin'
      ? 'Search transactions and merchants...'
      : 'Search transactions...';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-[560px] lg:top-[12%] p-0 [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:end-4">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="sr-only">Global search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-9 h-10"
            />
          </div>
        </DialogHeader>
        <DialogBody className="p-0 pb-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {!loading && noResults && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No transactions or merchants found for &quot;{query.trim()}&quot;
            </div>
          )}

          {!loading && !noResults && (transactions.length > 0 || merchants.length > 0) && (
            <ScrollArea className="max-h-[420px]">
              <div className="px-4 space-y-4">
                {transactions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Receipt className="size-3.5" />
                      Transactions
                    </h3>
                    <ul className="space-y-1">
                      {transactions.map((tx) => (
                        <li key={tx.id}>
                          <Link
                            href={
                              mode === 'admin'
                                ? '/admin/transactions/transactions'
                                : '/transactions/transactions'
                            }
                            onClick={() => onOpenChange(false)}
                            className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60 hover:border-border transition-colors"
                          >
                            <span className="font-mono text-foreground truncate">
                              {tx.transactionId}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              {formatAmount(tx.amountInUsd)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mode === 'admin' && merchants.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <User className="size-3.5" />
                      Merchants
                    </h3>
                    <ul className="space-y-1">
                      {merchants.map((m) => (
                        <li key={m.id}>
                          <Link
                            href={`/admin/user-management/merchant/${m.id}`}
                            onClick={() => onOpenChange(false)}
                            className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60 hover:border-border transition-colors"
                          >
                            <span className="font-medium text-foreground truncate">
                              {m.name || m.email || `Merchant ${m.id}`}
                            </span>
                            <span className="text-muted-foreground text-xs truncate max-w-[180px]">
                              {m.email}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {!loading && !noResults && !query.trim() && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Type to search {mode === 'admin' ? 'transactions and merchants' : 'transactions'}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
