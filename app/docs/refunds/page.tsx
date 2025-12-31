import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function RefundsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Refunds API</h1>
        <p className="text-xl text-muted-foreground">
          Process full or partial refunds for successful transactions.
        </p>
      </div>

      <Section title="Process Refund (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/refund"
          description="Processes a refund for a successful transaction. If amount is not provided, full refund is processed."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "transactionId": "TXN-20240101-ABC123",
  "amount": 50.00,
  "reason": "Customer requested refund"
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
                  <td className="p-2">Transaction ID to refund</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">amount</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Refund amount. If not provided, full refund is processed</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">reason</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Reason for refund</td>
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
                refundId: 'REF-20240101-XYZ789',
                transactionId: 'TXN-20240101-ABC123',
                amount: 50.00,
                status: 'PENDING',
                reason: 'Customer requested refund',
                createdAt: '2024-01-01T12:00:00Z',
              },
            }}
          />

          <Note type="info">
            Refunds can only be processed for transactions with status <code>SUCCESS</code>.
            Partial refunds are allowed, but the total refunded amount cannot exceed the original transaction amount.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Process Refund (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/refund"
          description="Processes a refund in sandbox mode for testing."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production endpoint.
          </p>
          <CodeBlock
            code={`{
  "transactionId": "TXN-20240101-ABC123",
  "amount": 50.00,
  "reason": "Customer requested refund"
}`}
          />
        </ApiEndpoint>
      </Section>
    </div>
  );
}

