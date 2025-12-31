import { Section, Note, CodeBlock } from './components/api-endpoint';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Lock,
  CreditCard,
  FileText,
  Wallet,
  RefreshCw,
  Link as LinkIcon,
  Coins,
  Search
} from 'lucide-react';

export default function DocsOverviewPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Payment APIs Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive API documentation for integrating payment processing into your applications.
        </p>
      </div>

      {/* Hero Image */}
      <div className="mb-12 flex justify-center">
        <div className="w-full max-w-3xl">
          <Image
            src="/media/svg/docs-overview.svg"
            alt="API Documentation Overview"
            width={809}
            height={682}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      <Section title="Overview">
        <p className="text-muted-foreground mb-4">
          The Pay4Tech Payment API provides a unified interface for processing payments across multiple payment methods,
          including card payments, alternative payment methods (APM), crypto payments, payouts, refunds, and payment links.
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="p-4 border rounded-lg">
            <Shield className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Bank-level encryption and PCI-DSS compliant infrastructure to protect your transactions.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Zap className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-2">Fast Processing</h3>
            <p className="text-sm text-muted-foreground">
              Real-time transaction processing with optimized infrastructure for instant responses.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Globe className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-2">Global Support</h3>
            <p className="text-sm text-muted-foreground">
              Multi-currency support and international payment methods for global reach.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <Lock className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold mb-2">API Key Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Secure API key-based authentication for all payment endpoints.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Base URL & Environments">
        <p className="text-muted-foreground mb-4">
          All API requests should be made to the following base URL:
        </p>
        <CodeBlock
          title="Base URL"
          code={`https://api.pay4tech.com`}
        />
        <p className="text-muted-foreground mt-4 mb-4">
          The difference between production and sandbox environments is in the API path:
        </p>
        <CodeBlock
          title="Production Endpoints"
          code={`https://api.pay4tech.com/api/v1/production/...`}
        />
        <CodeBlock
          title="Sandbox Endpoints (Testing)"
          code={`https://api.pay4tech.com/api/v1/sandbox/...`}
        />
        <Note type="info">
          Use the sandbox environment for testing and development. All sandbox transactions are simulated and do not process real payments.
        </Note>
      </Section>

      <Section title="Authentication">
        <p className="text-muted-foreground mb-4">
          All payment API endpoints require authentication using an API key. Include your API key in the Authorization header:
        </p>
        <CodeBlock
          title="Authorization Header"
          code={`Authorization: Bearer your_api_key_or_sandbox_api_key`}
        />
        <Note type="warning">
          <strong>Important:</strong> Keep your API keys secure. Never expose them in client-side code or commit them to version control.
          Use environment variables or secure key management systems.
        </Note>
        <p className="text-muted-foreground mt-4">
          You can obtain your API keys from your merchant dashboard after completing the onboarding process.
        </p>
      </Section>

      <Section title="API Versioning">
        <p className="text-muted-foreground mb-4">
          The Payment API uses versioning in the URL path. The current version is <Badge>v1</Badge>.
        </p>
        <CodeBlock
          code={`/api/v1/production/card
/api/v1/sandbox/card`}
        />
        <Note type="info">
          When we release breaking changes, we will increment the version number. We will provide migration guides
          and maintain backward compatibility for a reasonable period.
        </Note>
      </Section>

      <Section title="Request & Response Format">
        <h3 className="text-lg font-semibold mb-2">Content-Type</h3>
        <p className="text-muted-foreground mb-4">
          All requests must include the <code>Content-Type: application/json</code> header.
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">Request Body</h3>
        <p className="text-muted-foreground mb-4">
          Request bodies should be JSON-encoded objects.
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">Response Format</h3>
        <p className="text-muted-foreground mb-4">
          All responses are JSON objects. Successful responses return a <code>200 OK</code> status code.
        </p>
        <CodeBlock
          title="Success Response Example"
          code={`{
  "success": true,
  "data": {
    "transactionId": "TXN-20240101-ABC123",
    "status": "SUCCESS",
    "amount": 100.50,
    "currency": "USD"
  }
}`}
        />
      </Section>

      <Section title="Error Handling">
        <p className="text-muted-foreground mb-4">
          The API uses standard HTTP status codes to indicate success or failure:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-mono text-xs px-2 py-1">200 OK</Badge>
            <span className="text-sm text-foreground">Request succeeded</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 font-mono text-xs px-2 py-1">400 Bad Request</Badge>
            <span className="text-sm text-foreground">Invalid request parameters</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-mono text-xs px-2 py-1">401 Unauthorized</Badge>
            <span className="text-sm text-foreground">Invalid or missing API key</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-mono text-xs px-2 py-1">403 Forbidden</Badge>
            <span className="text-sm text-foreground">API key lacks required permissions</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-mono text-xs px-2 py-1">404 Not Found</Badge>
            <span className="text-sm text-foreground">Resource not found</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-mono text-xs px-2 py-1">429 Too Many Requests</Badge>
            <span className="text-sm text-foreground">Rate limit exceeded</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-mono text-xs px-2 py-1">500 Internal Server Error</Badge>
            <span className="text-sm text-foreground">Server error</span>
          </div>
        </div>
        <CodeBlock
          title="Error Response Format"
          code={`{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": {
      "field": "amount",
      "reason": "Amount must be greater than 0"
    }
  }
}`}
        />
      </Section>

      <Section title="Rate Limits">
        <p className="text-muted-foreground mb-4">
          To ensure fair usage and system stability, API requests are rate-limited:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold text-xs px-3 py-1">Standard Tier</Badge>
            <span className="text-sm text-foreground font-medium">100 requests per minute per API key</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold text-xs px-3 py-1">Premium Tier</Badge>
            <span className="text-sm text-foreground font-medium">500 requests per minute per API key</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs px-3 py-1">Enterprise Tier</Badge>
            <span className="text-sm text-foreground font-medium">Custom rate limits based on agreement</span>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          Rate limit information is included in response headers:
        </p>
        <CodeBlock
          code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200`}
        />
        <Note type="warning">
          If you exceed the rate limit, you will receive a <code>429 Too Many Requests</code> response.
          Wait until the reset time before making additional requests.
        </Note>
      </Section>

      <Section title="Idempotency">
        <p className="text-muted-foreground mb-4">
          For payment endpoints, you can include an <code>idempotencyKey</code> in the request header to ensure
          that duplicate requests are not processed multiple times:
        </p>
        <CodeBlock
          title="Idempotency Header"
          code={`Idempotency-Key: unique-key-per-request`}
        />
        <p className="text-muted-foreground mt-4">
          If you make the same request (with the same idempotency key) multiple times, only the first request
          will be processed. Subsequent requests will return the same response as the first request.
        </p>
        <Note type="info">
          Idempotency keys should be unique per transaction. Use a UUID or a unique identifier from your system.
        </Note>
      </Section>

      <Section title="Webhooks">
        <p className="text-muted-foreground mb-4">
          Webhooks allow you to receive real-time notifications about transaction status changes. Configure your
          webhook URL when creating a payment, and we will send POST requests to your endpoint when events occur.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-mono text-xs px-2 py-1">SUCCESS</Badge>
            <span className="text-sm text-foreground">Transaction successfully processed</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-mono text-xs px-2 py-1">FAILED</Badge>
            <span className="text-sm text-foreground">Transaction failed</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-mono text-xs px-2 py-1">BLOCKED</Badge>
            <span className="text-sm text-foreground">Transaction blocked due to security/compliance</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 mb-4">
          Webhook requests include a signature header for verification:
        </p>
        <CodeBlock
          code={`fs-webhook-hash: HMAC-SHA256 signature`}
        />
        <Note type="warning">
          Always verify webhook signatures to ensure requests are from Pay4Tech. The signature is generated using
          HMAC-SHA256 with your secret key.
        </Note>
      </Section>

      <Section title="Payment Statuses">
        <p className="text-muted-foreground mb-4">
          Transactions can have the following statuses:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">SUCCESS</Badge>
            <span className="text-sm text-muted-foreground">Payment has been successfully processed</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">FAILED</Badge>
            <span className="text-sm text-muted-foreground">Payment failed due to an error or insufficient funds</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">PENDING</Badge>
            <span className="text-sm text-muted-foreground">Payment is pending and awaiting further action</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">INIT</Badge>
            <span className="text-sm text-muted-foreground">Payment process has been initialized but not yet completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">REDIRECT</Badge>
            <span className="text-sm text-muted-foreground">User has been redirected to a third-party page for payment completion</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">BLOCKED</Badge>
            <span className="text-sm text-muted-foreground">Payment blocked due to security or compliance reasons</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">ABANDONED</Badge>
            <span className="text-sm text-muted-foreground">Payment process was started but not completed by the user</span>
          </div>
        </div>
      </Section>

      <Section title="Quick Start">
        <p className="text-muted-foreground mb-4">
          Ready to get started? Here's a quick example of processing a card payment:
        </p>
        <CodeBlock
          title="Example: Process Card Payment"
          language="bash"
          code={`curl -X POST https://api.pay4tech.com/api/v1/sandbox/card \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your_api_key_or_sandbox_api_key" \\
  -d '{
    "orderId": "ORD-12345",
    "amount": 100.50,
    "currency": "USD",
    "cardNumber": "4111111111111111",
    "cardExpiryMonth": 12,
    "cardExpiryYear": 2025,
    "cvv": "123",
    "cardholderName": "John Doe",
    "email": "john@example.com"
  }'`}
        />
        <div className="mt-6 flex gap-4">
          <Link href="/docs/card-payments">
            <Button>
              View Card Payments API
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      <Section title="API Categories">
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <Link 
            href="/docs/card-payments" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Card Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Process credit and debit card payments with server-to-server or hosted payment pages.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/apm-payments" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">APM Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Accept alternative payment methods like PayPal, Apple Pay, and Google Pay.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/payouts" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20 transition-colors">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Payouts</h3>
                <p className="text-sm text-muted-foreground">
                  Send payments to beneficiaries, check payout status, and manage transfers.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/wallet" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Check wallet balance, estimate payout amounts, and manage wallet transactions.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/refunds" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  Process full or partial refunds for successful transactions.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/payment-links" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Payment Links</h3>
                <p className="text-sm text-muted-foreground">
                  Create shareable payment links for customers to complete payments.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/crypto" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                <Coins className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Crypto Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Accept cryptocurrency payments, create crypto payment links, and process crypto exchanges.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
          
          <Link 
            href="/docs/transactions" 
            className="group p-5 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Query transaction status, retrieve transaction history, and filter transactions.
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>
        </div>
      </Section>
    </div>
  );
}

