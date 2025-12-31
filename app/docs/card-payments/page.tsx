import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function CardPaymentsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Card Payments API</h1>
        <p className="text-xl text-muted-foreground">
          Process credit and debit card payments using server-to-server integration or hosted payment pages.
        </p>
      </div>

      <Section title="Server-to-Server Card Payment (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/card"
          description="Processes a card payment directly without redirecting the user. This endpoint is suitable for server-side integrations where you handle card data securely."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "cardNumber": "4111111111111111",
  "cardExpiryMonth": 12,
  "cardExpiryYear": 2025,
  "cvv": "123",
  "cardholderName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
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
                  <td className="p-2">Unique order identifier from your system</td>
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
                  <td className="p-2">Currency code (3 letters, e.g., USD, EUR)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">merchantProfileId</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Merchant Profile ID. Defaults to user's PRIMARY profile if not provided</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardNumber</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Card number (13-19 digits)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardExpiryMonth</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Expiry month (1-12)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardExpiryYear</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Expiry year (4 digits)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cvv</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">CVV code (3-4 digits)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardholderName</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Cardholder name</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">firstName</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Customer first name</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">lastName</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Customer last name</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">email</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Customer email address</td>
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

          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                transactionId: 'TXN-20240101-ABC123',
                orderId: 'ORD-12345',
                status: 'SUCCESS',
                amount: 100.50,
                currency: 'USD',
                gatewayOrderId: 'GW-ORDER-123',
                createdAt: '2024-01-01T12:00:00Z',
              },
            }}
          />

          <ResponseExample
            title="Error Response"
            status={400}
            isError={true}
            response={{
              success: false,
              error: {
                code: 'INVALID_CARD',
                message: 'The card number is invalid',
              },
            }}
          />

          <Note type="warning">
            <strong>Important:</strong> This endpoint requires a merchant acquirer account to be assigned to your merchant profile.
            If no assignment exists, the transaction will fail immediately with a clear error message.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Server-to-Server Card Payment (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/card"
          description="Uses test gateway for sandbox testing. All transactions are simulated and do not process real payments."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production endpoint. Use test card numbers for testing:
          </p>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "cardNumber": "4111111111111111",
  "cardExpiryMonth": 12,
  "cardExpiryYear": 2025,
  "cvv": "123",
  "cardholderName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />

          <h4 className="font-semibold mb-2 mt-4">Test Card Numbers</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Card Number</th>
                  <th className="text-left p-2 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4111111111111111</td>
                  <td className="p-2">Success</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4242424242424242</td>
                  <td className="p-2">Success</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4000000000000002</td>
                  <td className="p-2">Failed</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4000000000009995</td>
                  <td className="p-2">Failed</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4000000000000069</td>
                  <td className="p-2">Blocked</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">4000000000000119</td>
                  <td className="p-2">Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ApiEndpoint>
      </Section>

      <Section title="Hosted Card Payment (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/hosted/card"
          description="Creates a hosted payment page. Returns a redirect URL for the customer to complete payment on our secure payment page."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "returnUrl": "https://your-domain.com/return",
  "cancelUrl": "https://your-domain.com/cancel",
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
                  <td className="p-2 font-mono text-xs">returnUrl</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">URL to redirect after successful payment</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cancelUrl</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">URL to redirect if payment is cancelled</td>
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

          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                redirectUrl: 'https://pay.pay4tech.com/payment/TXN-20240101-ABC123',
                paymentId: 'TXN-20240101-ABC123',
                orderId: 'ORD-12345',
              },
            }}
          />

          <Note type="info">
            Redirect the customer to the <code>redirectUrl</code> to complete payment. After payment completion,
            the customer will be redirected to your <code>returnUrl</code> or <code>cancelUrl</code>.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Hosted Card Payment (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/hosted/card"
          description="Creates a hosted payment page for sandbox testing. Same functionality as production but uses test gateway."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production hosted payment endpoint.
          </p>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "returnUrl": "https://your-domain.com/return",
  "cancelUrl": "https://your-domain.com/cancel",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Verify Hosted Card Payment (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/hosted/card/verify"
          description="Verifies and processes card details after customer returns from hosted payment page."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "transactionId": "TXN-20240101-ABC123",
  "merchantProfileId": 1,
  "cardNumber": "4111111111111111",
  "cardExpiryMonth": 12,
  "cardExpiryYear": 2025,
  "cvv": "123"
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
                  <td className="p-2 font-mono text-xs">transactionId</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Transaction ID from hosted payment</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">merchantProfileId</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Merchant Profile ID. Defaults to PRIMARY if not provided</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardNumber</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Card number (13-19 digits)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardExpiryMonth</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Expiry month (1-12)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cardExpiryYear</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Expiry year (4 digits)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">cvv</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">CVV code (3-4 digits)</td>
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
                transactionId: 'TXN-20240101-ABC123',
                status: 'SUCCESS',
                amount: 100.50,
                currency: 'USD',
              },
            }}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Verify Hosted Card Payment (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/hosted/card/verify"
          description="Verifies and processes card details after customer returns from hosted payment page (sandbox mode)."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production verify endpoint.
          </p>
          <CodeBlock
            code={`{
  "transactionId": "TXN-20240101-ABC123",
  "merchantProfileId": 1,
  "cardNumber": "4111111111111111",
  "cardExpiryMonth": 12,
  "cardExpiryYear": 2025,
  "cvv": "123"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Transaction Flow">
        <p className="text-muted-foreground mb-4">
          Card payment transactions follow this execution order:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
          <li>Merchant ownership validation (via API key)</li>
          <li>merchantProfileId validation (defaults to PRIMARY if not provided)</li>
          <li>merchant_acquirer_account validation (MANDATORY - fails if not assigned)</li>
          <li>IP whitelist check</li>
          <li>Risk management checks</li>
          <li>Card risk checks</li>
          <li>Routing & cascading logic (if configured)</li>
          <li>Acquirer API call</li>
        </ol>
        <Note type="warning">
          <strong>Critical:</strong> All transactions MUST execute through an assigned merchant_acquirer_account.
          If no assignment exists, the transaction will fail immediately with a clear error message.
        </Note>
      </Section>

      <Section title="Security & Risk Management">
        <p className="text-muted-foreground mb-4">
          For card payments, the following security checks are performed:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li><strong>IP Whitelist:</strong> Validates that the request IP is whitelisted (if IP whitelist is enabled)</li>
          <li><strong>Risk Rules:</strong> Checks for blocked cards, emails, IPs, domains, and BINs</li>
          <li><strong>Card Whitelist:</strong> Validates that the card is in trusted cards list (if card whitelist is enabled)</li>
        </ul>
        <Note type="error">
          If any risk check fails, the transaction is immediately blocked with status <code>BLOCKED</code> and a webhook is triggered.
        </Note>
      </Section>
    </div>
  );
}

