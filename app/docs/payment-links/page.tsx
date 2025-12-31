import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function PaymentLinksPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Payment Links API</h1>
        <p className="text-xl text-muted-foreground">
          Create shareable payment links for customers to complete payments.
        </p>
      </div>

      <Section title="Create Payment Link">
        <ApiEndpoint
          method="POST"
          path="/api/v1/payment-link"
          description="Creates a shareable payment link that can be sent to customers via email, SMS, or any other channel."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "description": "Product purchase",
  "customerEmail": "customer@example.com",
  "returnUrl": "https://your-domain.com/return",
  "webhookUrl": "https://your-domain.com/webhook",
  "expiresIn": 24
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
                  <td className="p-2 font-mono text-xs">description</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Payment description</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">customerEmail</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Customer email address</td>
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
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">expiresIn</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Expiration in hours (default: 24)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                paymentLinkId: 'LINK-20240101-ABC123',
                paymentLink: 'https://pay.pay4tech.com/pay/LINK-20240101-ABC123',
                orderId: 'ORD-12345',
                amount: 100.50,
                currency: 'USD',
                expiresAt: '2024-01-02T12:00:00Z',
              },
            }}
          />

          <Note type="info">
            Share the <code>paymentLink</code> URL with your customer. They can complete the payment by visiting this link.
            The link will expire after the specified <code>expiresIn</code> hours.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Get Payment Templates">
        <ApiEndpoint
          method="GET"
          path="/api/v1/payment-templates"
          description="Returns available payment link templates that can be used to customize the payment page appearance."
          requiresApiKey={true}
        >
          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                templates: [
                  {
                    id: 'template-1',
                    name: 'Default',
                    description: 'Default payment template',
                    previewUrl: 'https://pay.pay4tech.com/templates/default',
                  },
                  {
                    id: 'template-2',
                    name: 'Minimal',
                    description: 'Minimal payment template',
                    previewUrl: 'https://pay.pay4tech.com/templates/minimal',
                  },
                ],
              },
            }}
          />
        </ApiEndpoint>
      </Section>
    </div>
  );
}

