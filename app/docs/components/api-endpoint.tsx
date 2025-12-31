'use client';

import { ReactNode } from 'react';
import { Code } from '@/components/ui/code';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  requiresAuth?: boolean;
  children?: ReactNode;
}

const methodColors = {
  GET: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  POST: 'bg-green-500/10 text-green-600 dark:text-green-400',
  PUT: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
  PATCH: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

export function ApiEndpoint({
  method,
  path,
  description,
  requiresAuth = true,
  children,
}: ApiEndpointProps) {
  return (
    <div className="border rounded-lg overflow-hidden my-6">
      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={cn('font-mono', methodColors[method])}>
            {method}
          </Badge>
          <Code className="text-sm font-mono">{path}</Code>
        </div>
        {requiresAuth && (
          <Badge variant="outline" className="text-xs">
            Requires Auth
          </Badge>
        )}
      </div>
      {description && (
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      {children && <div className="p-4">{children}</div>}
    </div>
  );
}

interface CodeBlockProps {
  title?: string;
  code: string;
  language?: string;
}

export function CodeBlock({ title, code, language = 'json' }: CodeBlockProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="my-4">
      {title && (
        <h4 className="text-sm font-semibold mb-2 text-foreground">{title}</h4>
      )}
      <div className="relative group">
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
          <code className="text-sm font-mono">{code}</code>
        </pre>
        <button
          onClick={() => copyToClipboard(code)}
          className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy to clipboard"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

interface ResponseExampleProps {
  title: string;
  status: number;
  response: object;
  isError?: boolean;
}

export function ResponseExample({ title, status, response, isError = false }: ResponseExampleProps) {
  const StatusIcon = isError ? XCircle : CheckCircle2;
  const statusColor = isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-2">
        <StatusIcon className={cn('h-4 w-4', statusColor)} />
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge variant="outline" className="ml-auto">
          {status}
        </Badge>
      </div>
      <CodeBlock code={JSON.stringify(response, null, 2)} />
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{title}</h2>
      {children}
    </section>
  );
}

interface NoteProps {
  type?: 'info' | 'warning' | 'error';
  children: ReactNode;
}

export function Note({ type = 'info', children }: NoteProps) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className={cn('border rounded-lg p-4 my-4', styles[type])}>
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

