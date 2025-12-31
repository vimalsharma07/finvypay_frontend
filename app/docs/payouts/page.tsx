import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function PayoutsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Payouts API</h1>
        <p className="text-xl text-muted-foreground">
          Create payouts to beneficiaries, check payout status, and manage transfers.
        </p>
      </div>

      <Section title="Create Payout (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/payout"
          description="Creates a payout to a beneficiary."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "POUT-12345",
  "amount": 500.00,
  "currency": "USD",
  "merchantProfileId": 1,
  "beneficiaryId": "BEN-123",
  "description": "Monthly payout"
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
                  <td className="p-2">Payout amount (minimum 0.01)</td>
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
                  <td className="p-2 font-mono text-xs">beneficiaryId</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Beneficiary ID</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">description</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Payout description</td>
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
                payoutId: 'POUT-12345',
                orderId: 'POUT-12345',
                status: 'PENDING',
                amount: 500.00,
                currency: 'USD',
                beneficiaryId: 'BEN-123',
                createdAt: '2024-01-01T12:00:00Z',
              },
            }}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Create Payout (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/payout"
          description="Creates a payout in sandbox mode for testing."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production endpoint.
          </p>
          <CodeBlock
            code={`{
  "orderId": "POUT-12345",
  "amount": 500.00,
  "currency": "USD",
  "merchantProfileId": 1,
  "beneficiaryId": "BEN-123",
  "description": "Monthly payout"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Get Payout Status (Production)">
        <ApiEndpoint
          method="GET"
          path="/api/v1/production/payout/:id/status"
          description="Returns the current status of a payout."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Path Parameters</h4>
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
                  <td className="p-2 font-mono text-xs">id</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Payout ID or Order ID</td>
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
                payoutId: 'POUT-12345',
                orderId: 'POUT-12345',
                status: 'SUCCESS',
                amount: 500.00,
                currency: 'USD',
                beneficiaryId: 'BEN-123',
                completedAt: '2024-01-01T12:05:00Z',
              },
            }}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Get Payout Status (Sandbox)">
        <ApiEndpoint
          method="GET"
          path="/api/v1/sandbox/payout/:id/status"
          description="Returns the current status of a payout in sandbox mode."
          requiresAuth={true}
        >
          <h4 className="font-semibold mb-2">Path Parameters</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same as production endpoint.
          </p>
        </ApiEndpoint>
      </Section>
    </div>
  );
}

