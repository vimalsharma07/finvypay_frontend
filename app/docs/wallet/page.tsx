import { Section, ApiEndpoint, CodeBlock, ResponseExample } from '../components/api-endpoint';

export default function WalletPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Wallet API</h1>
        <p className="text-xl text-muted-foreground">
          Check wallet balance, estimate payout amounts, and manage wallet transactions.
        </p>
      </div>

      <Section title="Get Wallet Details">
        <ApiEndpoint
          method="GET"
          path="/api/v1/wallet"
          description="Returns wallet balance and details for the authenticated user."
          requiresApiKey={true}
        >
          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                balance: 10000.50,
                currency: 'USD',
                availableBalance: 9500.00,
                pendingBalance: 500.50,
                lastUpdated: '2024-01-01T12:00:00Z',
              },
            }}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Estimate Payout Amount">
        <ApiEndpoint
          method="POST"
          path="/api/v1/wallet/estimate-payout"
          description="Calculates fees and net amount for a payout before processing."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "amount": 500.00,
  "currency": "USD"
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
                  <td className="p-2 font-mono text-xs">amount</td>
                  <td className="p-2">number</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Payout amount</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">currency</td>
                  <td className="p-2">string</td>
                  <td className="p-2">Yes</td>
                  <td className="p-2">Currency code (3 letters)</td>
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
                grossAmount: 500.00,
                fee: 2.50,
                netAmount: 497.50,
                currency: 'USD',
              },
            }}
          />
        </ApiEndpoint>
      </Section>
    </div>
  );
}

