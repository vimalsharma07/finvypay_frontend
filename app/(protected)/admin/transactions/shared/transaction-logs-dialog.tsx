'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Webhook, Server, Send } from 'lucide-react';
import { getAdminLogs, type LogEntry, type LogType } from '@/lib/services/admin/logs';
import { resendTransactionWebhook, Transaction } from '@/lib/services/admin/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TransactionLogEntryDetail } from './transaction-log-entry-detail';

type TransactionLogTab = 'txn_logs' | 'webhook_logs' | 'provider_logs';

const TAB_META: Record<TransactionLogTab, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  txn_logs: { label: 'Transaction Log', icon: FileText },
  webhook_logs: { label: 'Webhook Log', icon: Webhook },
  provider_logs: { label: 'Provider Log', icon: Server },
};

interface TransactionLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  paymentMode: 'production' | 'sandbox';
}

export function TransactionLogsDialog({
  open,
  onOpenChange,
  transaction,
  paymentMode,
}: TransactionLogsDialogProps) {
  const [activeTab, setActiveTab] = useState<TransactionLogTab>('txn_logs');
  const [loadingByTab, setLoadingByTab] = useState<Record<TransactionLogTab, boolean>>({
    txn_logs: false,
    webhook_logs: false,
    provider_logs: false,
  });
  const [logsByTab, setLogsByTab] = useState<Record<TransactionLogTab, LogEntry[]>>({
    txn_logs: [],
    webhook_logs: [],
    provider_logs: [],
  });
  const [isResendingWebhook, setIsResendingWebhook] = useState(false);
  const requestSeqRef = useRef(0);

  const transactionId = transaction?.transactionId?.trim() || '';
  const internalTransactionId = transaction?.id ? String(transaction.id).trim() : '';
  const orderId = transaction?.orderId?.trim() || '';
  const gatewayId = transaction?.gatewayId?.trim() || '';

  const fetchByTransactionId = useCallback(
    async (type: LogType, txnId: string, mode?: 'production' | 'sandbox') => {
      return await new Promise<LogEntry[]>((resolve, reject) => {
        getAdminLogs({
          type,
          page: 1,
          limit: 50,
          transaction_id: txnId,
          ...(mode ? { payment_mode: mode } : {}),
        })
          .then((response) => {
            handleApiResponse(response, {
              onSuccess: (data) => {
                if (data?.success && Array.isArray(data.data)) {
                  resolve(data.data);
                  return;
                }
                resolve([]);
              },
              onError: (message) => {
                reject(new Error(message || 'Failed to fetch logs'));
              },
            });
          })
          .catch((error) => reject(error));
      });
    },
    []
  );

  const loadTabLogs = useCallback(
    async (tab: TransactionLogTab) => {
      if (!open || !transactionId) return;
      const requestId = ++requestSeqRef.current;
      setLoadingByTab((prev) => ({ ...prev, [tab]: true }));

      try {
        let nextLogs: LogEntry[] = [];

        if (tab === 'provider_logs') {
          const identifiers = Array.from(
            new Set(
              [transactionId, internalTransactionId, orderId, gatewayId]
                .map((v) => v.trim())
                .filter(Boolean)
            )
          );

          const settled = await Promise.allSettled(
            identifiers.map((id) => fetchByTransactionId('provider_logs', id))
          );

          const merged = settled
            .filter((result): result is PromiseFulfilledResult<LogEntry[]> => result.status === 'fulfilled')
            .flatMap((result) => result.value);

          const deduped = new Map<string, LogEntry>();
          for (const log of merged) {
            deduped.set(String(log.id), log);
          }
          nextLogs = Array.from(deduped.values());
        } else {
          nextLogs = await fetchByTransactionId(tab, transactionId, paymentMode);
        }

        if (requestId !== requestSeqRef.current) return;
        setLogsByTab((prev) => ({ ...prev, [tab]: nextLogs }));
      } catch (error) {
        if (requestId !== requestSeqRef.current) return;
        toast.error(`Failed to load ${TAB_META[tab].label.toLowerCase()}`);
      } finally {
        if (requestId !== requestSeqRef.current) return;
        setLoadingByTab((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [open, transactionId, internalTransactionId, orderId, gatewayId, paymentMode, fetchByTransactionId]
  );

  const handleResendWebhook = useCallback(async () => {
    if (!transactionId) {
      toast.error('Missing transaction ID');
      return;
    }
    setIsResendingWebhook(true);
    try {
      const response = await resendTransactionWebhook(transactionId, paymentMode === 'sandbox');
      handleApiResponse(response, {
        onSuccess: (data) => {
          const msg =
            data &&
            typeof data === 'object' &&
            'message' in data &&
            data.message != null &&
            String(data.message).trim()
              ? String(data.message)
              : 'Webhook resent successfully';
          toast.success(msg);
          void loadTabLogs('webhook_logs');
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to resend webhook');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Resend webhook error:', error);
    } finally {
      setIsResendingWebhook(false);
    }
  }, [transactionId, paymentMode, loadTabLogs]);

  useEffect(() => {
    loadTabLogs(activeTab);
  }, [activeTab, loadTabLogs]);

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Transaction Logs</DialogTitle>
          <DialogDescription>
            Transaction ID: <span className="font-mono">{transactionId || '-'}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="px-6 pb-6 pt-4 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionLogTab)} className="flex gap-4 h-[68vh]">
            <TabsList className="flex flex-col items-stretch w-56 h-fit p-2 bg-muted/50 rounded-lg">
              {(Object.keys(TAB_META) as TransactionLogTab[]).map((tabKey) => {
                const Icon = TAB_META[tabKey].icon;
                return (
                  <TabsTrigger
                    key={tabKey}
                    value={tabKey}
                    className="justify-start gap-2 py-2.5 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground [&_svg]:text-current [&:hover_svg]:text-current [&[data-state=active]_svg]:text-current"
                  >
                    <Icon className="size-4" />
                    <span>{TAB_META[tabKey].label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="flex-1 min-w-0 border rounded-lg">
              {(Object.keys(TAB_META) as TransactionLogTab[]).map((tabKey) => {
                const tabLogs = logsByTab[tabKey];
                const tabLoading = loadingByTab[tabKey];
                const tabTitle = TAB_META[tabKey].label;
                return (
                  <TabsContent key={tabKey} value={tabKey} className="mt-0 h-full">
                    <div className="flex h-full flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                        <h3 className="font-semibold">{tabTitle}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {tabKey === 'webhook_logs' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              disabled={!transactionId || isResendingWebhook}
                              onClick={() => void handleResendWebhook()}
                            >
                              {isResendingWebhook ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Send className="size-3.5" />
                              )}
                              Resend webhook
                            </Button>
                          )}
                          <Badge variant="outline">{tabLogs.length} entries</Badge>
                        </div>
                      </div>
                      <ScrollArea className="min-w-0 flex-1 p-4" viewportClassName="min-w-0">
                        {tabLoading ? (
                          <div className="flex h-full min-h-[220px] items-center justify-center text-muted-foreground">
                            <Loader2 className="mr-2 size-5 animate-spin" />
                            Loading logs...
                          </div>
                        ) : tabLogs.length === 0 ? (
                          <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                            No logs found for this transaction.
                          </div>
                        ) : (
                          <div className="min-w-0 space-y-8">
                            {tabLogs.map((log, index) => (
                              <div key={`${tabKey}-${log.id}-${index}`} className="space-y-3">
                                {index > 0 && (
                                  <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                      <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
                                      <span className="bg-background px-2">Next log</span>
                                    </div>
                                  </div>
                                )}
                                <TransactionLogEntryDetail log={log} variant={tabKey} />
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

