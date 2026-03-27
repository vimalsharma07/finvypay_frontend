'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/lib/services/admin/logs';
import { Copy, Hash, Clock, Server, Send, ArrowDownToLine, FileJson, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type LogVariant = 'txn_logs' | 'webhook_logs' | 'provider_logs';

function formatWhen(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
}

function copyJson(label: string, value: unknown) {
  const text =
    typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2);
  void navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Copy failed')
  );
}

function JsonPanel({
  title,
  icon: Icon,
  data,
  variant = 'default',
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: unknown;
  variant?: 'default' | 'muted' | 'warn';
}) {
  if (data == null || (typeof data === 'object' && data !== null && Object.keys(data as object).length === 0)) {
    return null;
  }

  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const headerClass =
    variant === 'warn'
      ? 'bg-amber-500/10 border-b border-amber-500/20'
      : variant === 'muted'
        ? 'bg-muted/40 border-b'
        : 'bg-primary/5 border-b border-border';

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border shadow-sm">
      <div className={cn('flex min-w-0 items-center justify-between gap-2 px-3 py-2.5', headerClass)}>
        <div className="min-w-0 flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 shrink-0 text-primary" />
          {title}
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-8 shrink-0 gap-1" onClick={() => copyJson(title, data)}>
          <Copy className="size-3.5" />
          Copy
        </Button>
      </div>
      <div className="max-h-[min(320px,40vh)] min-w-0 overflow-x-auto overflow-y-auto">
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          wrapLongLines
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '12px',
            lineHeight: 1.5,
            maxWidth: '100%',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
          codeTagProps={{
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            },
          }}
          showLineNumbers={false}
        >
          {str}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5 rounded-lg border bg-muted/20 p-3', className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="min-w-0 break-all text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function txnStatusLabel(status: number | undefined): { label: string; className: string } {
  switch (status) {
    case 0:
      return { label: 'Pending', className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' };
    case 1:
      return { label: 'Success', className: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' };
    case 2:
      return { label: 'Failed', className: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30' };
    case 3:
      return { label: 'Blocked', className: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30' };
    default:
      return {
        label: status != null ? `Status ${status}` : '—',
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
}

/** Webhook log status: 0 failed, 1 success, 2 pending (see transaction-webhook-log.entity) */
function webhookStatusLabel(status: number | undefined): { label: string; className: string } {
  switch (status) {
    case 0:
      return { label: 'Failed', className: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30' };
    case 1:
      return { label: 'Success', className: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' };
    case 2:
      return { label: 'Pending', className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' };
    default:
      return {
        label: status != null ? `Status ${status}` : '—',
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
}

export function TransactionLogEntryDetail({ log, variant }: { log: LogEntry; variant: LogVariant }) {
  const txnId = log.transactionId ?? log.transaction_id ?? '—';
  const created = log.createdAt ?? log.created_at;
  const updated = log.updatedAt ?? log.updated_at;

  if (variant === 'webhook_logs') {
    const st = webhookStatusLabel(log.status);
    const retry = log.retryCount ?? log.retry_count;
    const sent = log.sentCount ?? log.sent_count;
    const webhookUrl = log.webhookUrl ?? log.webhook_url;

    return (
      <div className="min-w-0 max-w-full space-y-4">
        <div className="min-w-0 max-w-full overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex min-w-0 flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <Send className="size-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Webhook details</h4>
                <p className="text-xs text-muted-foreground">Delivery attempt to merchant webhook URL</p>
              </div>
            </div>
            <Badge variant="outline" className={cn('shrink-0 border', st.className)}>
              {st.label}
            </Badge>
          </div>
          <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Transaction ID">
              <span className="font-mono text-xs">{txnId}</span>
            </Field>
            {retry != null && <Field label="Retry count">{String(retry)}</Field>}
            {sent != null && <Field label="Sent count">{String(sent)}</Field>}
            <Field label="Created at">{formatWhen(created)}</Field>
            {updated && <Field label="Updated at">{formatWhen(updated)}</Field>}
            {webhookUrl && (
              <Field label="Webhook URL" className="sm:col-span-2 lg:col-span-4">
                <span className="block font-mono text-xs break-all">{String(webhookUrl)}</span>
              </Field>
            )}
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <JsonPanel title="Payload" icon={Send} data={log.payload} />
          <JsonPanel title="Response" icon={ArrowDownToLine} data={log.response} variant="muted" />
        </div>
        <RawJsonDisclosure log={log} />
      </div>
    );
  }

  if (variant === 'txn_logs') {
    const st = txnStatusLabel(log.status);
    const orderId = log.orderId ?? log.order_id;

    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                <FileJson className="size-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Transaction API log</h4>
                <p className="text-xs text-muted-foreground">Internal API / status change / payload trace</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {log.type != null && log.type !== '' && (
                <Badge variant="outline" className="font-mono text-xs">
                  {String(log.type)}
                </Badge>
              )}
              <Badge variant="outline" className={cn('border', st.className)}>
                {st.label}
              </Badge>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Transaction ID">
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <Hash className="size-3.5 opacity-60" />
                {txnId}
              </span>
            </Field>
            <Field label="Log ID">
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                <Hash className="size-3.5 opacity-60" />
                {String(log.id)}
              </span>
            </Field>
            <Field label="Created at">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 opacity-60" />
                {formatWhen(created)}
              </span>
            </Field>
            {orderId != null && orderId !== '' && (
              <Field label="Order ID">
                <span className="font-mono text-xs">{String(orderId)}</span>
              </Field>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <JsonPanel title="Payload" icon={Send} data={log.payload} />
          <JsonPanel title="Response" icon={ArrowDownToLine} data={log.response} variant="muted" />
          {log.webhook != null && <JsonPanel title="Webhook (payload snapshot)" icon={Send} data={log.webhook} />}
          {log.headers != null && <JsonPanel title="Headers" icon={FileJson} data={log.headers} variant="muted" />}
        </div>
        <RawJsonDisclosure log={log} />
      </div>
    );
  }

  // provider_logs
  const provider = log.provider ?? '—';
  const action = log.action ?? '—';
  const method = log.method ?? '—';
  const endpoint = log.endpoint ?? null;
  const responseStatus = log.responseStatus ?? log.response_status;
  const providerRef = log.providerReference ?? log.provider_reference;
  const err = log.error;

  const httpOk = responseStatus != null && responseStatus >= 200 && responseStatus < 300;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Server className="size-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Provider integration</h4>
              <p className="text-xs text-muted-foreground">
                {String(provider)} · {String(action)}
              </p>
            </div>
          </div>
          {responseStatus != null && (
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 font-mono',
                httpOk
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-300'
              )}
            >
              HTTP {responseStatus}
            </Badge>
          )}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Provider">
            <span className="font-medium">{String(provider)}</span>
          </Field>
          <Field label="Action">
            <span className="font-mono text-xs">{String(action)}</span>
          </Field>
          <Field label="Method">
            <span className="font-mono text-xs">{String(method)}</span>
          </Field>
          <Field label="Transaction ID">
            <span className="font-mono text-xs">{txnId}</span>
          </Field>
          <Field label="Log ID">
            <span className="font-mono text-xs">{String(log.id)}</span>
          </Field>
          <Field label="Created at">{formatWhen(created)}</Field>
          {providerRef != null && providerRef !== '' && (
            <Field label="Provider reference" className="sm:col-span-2">
              <span className="font-mono text-xs break-all">{String(providerRef)}</span>
            </Field>
          )}
          {endpoint != null && endpoint !== '' && (
            <Field label="Endpoint" className="sm:col-span-2 lg:col-span-3">
              <span className="font-mono text-xs break-all">{String(endpoint)}</span>
            </Field>
          )}
        </div>
        {err != null && err !== '' && (
          <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="break-words">{typeof err === 'string' ? err : JSON.stringify(err)}</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <JsonPanel title="Request" icon={Send} data={log.request} />
        <JsonPanel title="Payload" icon={Send} data={log.payload} variant="muted" />
        <JsonPanel title="Response" icon={ArrowDownToLine} data={log.response} variant="muted" />
        {log.binResponse != null && (
          <JsonPanel title="BIN response" icon={FileJson} data={log.binResponse} variant="muted" />
        )}
      </div>
      <RawJsonDisclosure log={log} />
    </div>
  );
}

function RawJsonDisclosure({ log }: { log: LogEntry }) {
  return (
    <details className="min-w-0 rounded-lg border border-dashed border-border/80 bg-muted/10 px-3 py-2">
      <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground hover:text-foreground">
        View raw log (JSON)
      </summary>
      <pre className="mt-2 max-h-48 min-w-0 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-muted/30 p-2 text-[10px] leading-relaxed [overflow-wrap:anywhere]">
        {JSON.stringify(log, null, 2)}
      </pre>
    </details>
  );
}
