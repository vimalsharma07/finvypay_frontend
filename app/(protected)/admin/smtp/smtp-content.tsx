'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getSmtpConfig,
  sendSmtpTestEmail,
  type SmtpConfig,
  type SmtpTestLog,
} from '@/lib/services/admin/smtp';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, RefreshCw, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

function maskSecret(value: string): string {
  if (!value) return '—';
  if (value.length <= 4) return '•'.repeat(value.length);
  return `${'•'.repeat(Math.max(value.length - 4, 6))}${value.slice(-4)}`;
}

function logTone(level: SmtpTestLog['level']): string {
  if (level === 'success') return 'text-emerald-600 dark:text-emerald-400';
  if (level === 'error') return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

export function SmtpPageContent() {
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [to, setTo] = useState('');
  const [logs, setLogs] = useState<SmtpTestLog[]>([]);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSmtpConfig();
      handleApiResponse(response, {
        silent: true,
        onSuccess: (data) => {
          setConfig(data.data);
        },
        onError: (message) => {
          setConfig(null);
          toast.error(message || 'Failed to load SMTP config');
          setLogs([{ level: 'error', message: message || 'Failed to load SMTP config' }]);
          setLastResult('error');
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const email = to.trim();
    if (!email) {
      toast.error('Enter a recipient email');
      return;
    }

    setSending(true);
    setLogs([{ level: 'info', message: `Sending test email to ${email}...` }]);
    setLastResult(null);

    try {
      const response = await sendSmtpTestEmail({ to: email });
      const result = response.data;
      const nextLogs: SmtpTestLog[] = result?.logs?.length
        ? result.logs
        : [
            {
              level: response.status === 200 && result?.success ? 'success' : 'error',
              message: result?.message || response.error || 'No logs returned',
            },
          ];

      setLogs(nextLogs);

      if (result?.success) {
        setLastResult('success');
        toast.success('Test email sent');
      } else {
        setLastResult('error');
        toast.error(result?.message || response.error || 'Failed to send test email');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>SMTP credentials</CardTitle>
                <CardDescription>
                  Loaded from <code className="text-xs">/smtp-config</code>
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => void loadConfig()} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && !config ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading SMTP config...
              </div>
            ) : config ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Host" value={config.host} />
                <InfoRow label="Port" value={String(config.port)} />
                <InfoRow label="Username" value={config.username} />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
                      {showPassword ? config.password || '—' : maskSecret(config.password)}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      mode="icon"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </div>
                <InfoRow label="From" value={config.from} />
                <InfoRow label="From name" value={config.fromName || '—'} />
                <div className="sm:col-span-2">
                  <InfoRow label="Logo URL" value={config.logoUrl || '—'} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No SMTP config available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send test email</CardTitle>
            <CardDescription>Sends a dummy mail using the loaded SMTP credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSend}>
              <div className="space-y-1.5">
                <Label htmlFor="smtp-test-email">Recipient email</Label>
                <Input
                  id="smtp-test-email"
                  type="email"
                  placeholder="name@example.com"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending || !config}>
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {sending ? 'Sending...' : 'Send dummy email'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Email logs</CardTitle>
              <CardDescription>Connection and delivery output from the last test send.</CardDescription>
            </div>
            {lastResult ? (
              <Badge variant={lastResult === 'success' ? 'success' : 'destructive'}>
                {lastResult === 'success' ? 'Sent' : 'Failed'}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                No logs yet. Send a test email to see SMTP output here.
              </div>
            ) : (
              <div className="max-h-72 overflow-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs leading-6">
                {logs.map((log, index) => (
                  <div key={`${log.level}-${index}`} className={cn('break-all', logTone(log.level))}>
                    [{log.level.toUpperCase()}] {log.message}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm break-all">{value}</div>
    </div>
  );
}
