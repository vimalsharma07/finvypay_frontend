import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function ApmPaymentsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">APM Payments API</h1>
        <p className="text-xl text-muted-foreground">
          Process alternative payment methods (APM) including PayPal, Apple Pay, Google Pay, and more.
        </p>
      </div>

      <Section title="APM Payment (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/apm"
          description="Processes Alternative Payment Method payment (PayPal, Apple Pay, Google Pay, etc.)"
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "paymentMethod": "paypal",
  "returnUrl": "https://your-domain.com/return",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />

          <h4 className="font-semibold mb-2 mt-4">Request Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Parameter</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Required</th>
                  <th className="text-left p-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">orderId</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Unique order identifier</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">amount</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Payment amount (minimum 0.01)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">currency</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Currency code (3 letters)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">merchantProfileId</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Merchant Profile ID. Defaults to PRIMARY if not provided</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">paymentMethod</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Payment method: paypal, apple_pay, google_pay, etc.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">returnUrl</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">URL to redirect after payment</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">webhookUrl</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Webhook URL for transaction notifications</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="font-semibold mb-2 mt-4">Supported Payment Methods</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
            <li><code>paypal</code> - PayPal</li>
            <li><code>apple_pay</code> - Apple Pay</li>
            <li><code>google_pay</code> - Google Pay</li>
            <li>Additional methods may be available based on your merchant configuration</li>
          </ul>

          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                transactionId: 'TXN-20240101-ABC123',
                orderId: 'ORD-12345',
                status: 'REDIRECT',
                redirectUrl: 'https://paypal.com/checkout/...',
                amount: 100.50,
                currency: 'USD',
              },
            }}
          />

          <Note type="info">
            APM payments typically redirect users to the payment provider's page. Use the <code>redirectUrl</code>
            from the response to redirect the customer.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="APM Payment (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/apm"
          description="Processes APM payment in sandbox mode for testing."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production endpoint.
          </p>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "paymentMethod": "paypal",
  "returnUrl": "https://your-domain.com/return",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />
        </ApiEndpoint>
      </Section>
    </div>
  );
}

