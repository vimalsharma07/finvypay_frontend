'use client';

import { Fragment, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, LockKeyhole, Webhook } from 'lucide-react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code } from '@/components/ui/code';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getApiCredentials, type ApiCredentialsData } from '@/lib/services/user/api-credentials';
import { toast } from 'sonner';

export default function UserConfigPage() {
  const [credentials, setCredentials] = useState<ApiCredentialsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredentials = async () => {
      setLoading(true);
      try {
        const response = await getApiCredentials();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.success && data.data) {
              setCredentials(data.data);
            } else {
              setCredentials(null);
              toast.error('No API credentials found for your account');
            }
          },
          onError: (message) => {
            toast.error(message || 'Failed to load API credentials');
          },
          silent: true,
        });
      } catch (error) {
        console.error('API credentials fetch error:', error);
        toast.error('An unexpected error occurred while fetching API credentials');
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Preferences"
            description="API keys, encryption, and webhook hash for your integrations"
            icon={KeyRound}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
            Workspace
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep keys private — use test credentials in sandbox and live keys only in production.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading configuration...
          </div>
        ) : !credentials ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            No configuration data available.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Test Secret Key
                </CardTitle>
                <CardDescription>
                  Use this key for sandbox and testing environments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Code showCopyButton copyText={credentials.testSecretKey} className="w-full">
                  {credentials.testSecretKey}
                </Code>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Live Secret Key
                </CardTitle>
                <CardDescription>
                  Use this key only in production environments. Keep it secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Code showCopyButton copyText={credentials.liveSecretKey} className="w-full">
                  {credentials.liveSecretKey}
                </Code>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle className="flex items-center gap-2">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                  Encryption Key
                </CardTitle>
                <CardDescription>
                  Use this key to encrypt sensitive fields in your integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Code showCopyButton copyText={credentials.encryptionKey} className="w-full">
                  {credentials.encryptionKey}
                </Code>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
              <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Webhook Hash
                </CardTitle>
                <CardDescription>
                  Validate webhook payloads using this hash.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Code showCopyButton copyText={credentials.webhookHash} className="w-full">
                  {credentials.webhookHash}
                </Code>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </Fragment>
  );
}
