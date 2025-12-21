'use client';

import { Fragment, useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface ApiCredentialsData {
  testSecretKey: string;
  liveSecretKey: string;
  encryptionKey: string | null;
  webhookHash: string | null;
}

export function ApiCredentials() {
  const [credentials, setCredentials] = useState<ApiCredentialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiCredentials();
  }, []);

  const fetchApiCredentials = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/auth/api-credentials', 'GET', {
        auth: true,
      });

      if (response && response.testSecretKey) {
        setCredentials(response);
      } else {
        toast.error('Failed to load API credentials');
      }
    } catch (error: any) {
      console.error('Failed to fetch API credentials:', error);
      toast.error(error?.message || 'Failed to load API credentials');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedKey(keyName);
        toast.success(`${keyName} copied to clipboard`);
        setTimeout(() => {
          setCopiedKey(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load API credentials
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground leading-5.5 pb-5">
          The granted credentials serve a twofold function, enabling{' '}
          <Button mode="link" asChild>
            <a href="#api-authentication">API authentication</a>
          </Button>{' '}
          and governing JavaScript customization
        </div>
        <div className="flex flex-col flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Test Secret Key</label>
            <InputWrapper>
              <Input
                type="text"
                readOnly
                value={credentials.testSecretKey || ''}
                className="font-mono text-sm"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="dim"
                    mode="icon"
                    className="-me-2"
                    onClick={() => copyToClipboard(credentials.testSecretKey, 'testSecretKey')}
                  >
                    {copiedKey === 'testSecretKey' ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
            </InputWrapper>
            <p className="text-xs text-muted-foreground">
              Use this key in the Authorization header for sandbox/test API calls
            </p>
          </div>

          {credentials.liveSecretKey && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Live Secret Key (Production)</label>
              <InputWrapper>
                <Input
                  type="text"
                  readOnly
                  value={credentials.liveSecretKey || ''}
                  className="font-mono text-sm"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="dim"
                      mode="icon"
                      className="-me-2"
                      onClick={() => copyToClipboard(credentials.liveSecretKey, 'liveSecretKey')}
                    >
                      {copiedKey === 'liveSecretKey' ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>
              </InputWrapper>
              <p className="text-xs text-muted-foreground">
                Use this key in the Authorization header for production API calls
              </p>
            </div>
          )}

          {credentials.encryptionKey && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Encryption Key</label>
              <InputWrapper>
                <Input
                  type="text"
                  readOnly
                  value={credentials.encryptionKey}
                  className="font-mono text-sm"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="dim"
                      mode="icon"
                      className="-me-2"
                      onClick={() => copyToClipboard(credentials.encryptionKey!, 'encryptionKey')}
                    >
                      {copiedKey === 'encryptionKey' ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>
              </InputWrapper>
              <p className="text-xs text-muted-foreground">
                Encryption key for secure data handling
              </p>
            </div>
          )}

          {credentials.webhookHash && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Webhook Hash</label>
              <InputWrapper>
                <Input
                  type="text"
                  readOnly
                  value={credentials.webhookHash}
                  className="font-mono text-sm"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="dim"
                      mode="icon"
                      className="-me-2"
                      onClick={() => copyToClipboard(credentials.webhookHash!, 'webhookHash')}
                    >
                      {copiedKey === 'webhookHash' ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>
              </InputWrapper>
              <p className="text-xs text-muted-foreground">
                Webhook hash for verifying webhook requests
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

