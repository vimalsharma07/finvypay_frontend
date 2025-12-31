import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function TransactionsPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Transactions API</h1>
        <p className="text-xl text-muted-foreground">
          Query transaction status, retrieve transaction history, and filter transactions.
        </p>
      </div>

      <Section title="Get Transaction Status (Production)">
        <ApiEndpoint
          method="GET"
          path="/api/production/status/:id"
          description="Returns the current status of a transaction. No authentication required."
          requiresAuth={false}
          requiresApiKey={false}
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
                  <td className="p-2">Transaction ID</td>
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
                createdAt: '2024-01-01T12:00:00Z',
                completedAt: '2024-01-01T12:00:05Z',
              },
            }}
          />

          <Note type="info">
            This endpoint does not require authentication, making it suitable for public status checks.
            However, it only returns basic transaction status information.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Get Transaction Status (Sandbox)">
        <ApiEndpoint
          method="GET"
          path="/api/sandbox/status/:id"
          description="Returns the current status of a transaction in sandbox mode. No authentication required."
          requiresAuth={false}
        >
          <h4 className="font-semibold mb-2">Path Parameters</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same as production endpoint.
          </p>
        </ApiEndpoint>
      </Section>

      <Section title="Get Production Transactions">
        <ApiEndpoint
          method="GET"
          path="/api/v1/production-transactions"
          description="Returns paginated list of production transactions with filtering options."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Query Parameters</h4>
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
                  <td className="p-2 font-mono text-xs">page</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Page number (default: 1)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">limit</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Items per page (default: 20, max: 100)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">status</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Filter by status (SUCCESS, FAILED, PENDING, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">transactionId</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Filter by transaction ID</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">orderId</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Filter by order ID</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">startDate</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Start date (ISO 8601 format)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">endDate</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">End date (ISO 8601 format)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <CodeBlock
            title="Example Request"
            code={`GET /api/v1/production-transactions?page=1&limit=20&status=SUCCESS&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z`}
          />

          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                transactions: [
                  {
                    transactionId: 'TXN-20240101-ABC123',
                    orderId: 'ORD-12345',
                    status: 'SUCCESS',
                    amount: 100.50,
                    currency: 'USD',
                    createdAt: '2024-01-01T12:00:00Z',
                  },
                ],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 100,
                  totalPages: 5,
                },
              },
            }}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Get Sandbox Transactions">
        <ApiEndpoint
          method="GET"
          path="/api/v1/sandbox-transactions"
          description="Returns paginated list of sandbox transactions."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Query Parameters</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same query parameters as production transactions endpoint.
          </p>
        </ApiEndpoint>
      </Section>

      <Section title="Get Production Wallet Transactions">
        <ApiEndpoint
          method="GET"
          path="/api/v1/production-wallet-transactions"
          description="Returns paginated list of production wallet/payout transactions."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Query Parameters</h4>
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
                  <td className="p-2 font-mono text-xs">page</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Page number (default: 1)</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-mono text-xs">limit</td>
                  <td className="p-2">number</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Items per page (default: 20, max: 100)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ApiEndpoint>
      </Section>

      <Section title="Get Sandbox Wallet Transactions">
        <ApiEndpoint
          method="GET"
          path="/api/v1/sandbox-wallet-transactions"
          description="Returns paginated list of sandbox wallet/payout transactions."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Query Parameters</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same query parameters as production wallet transactions endpoint.
          </p>
        </ApiEndpoint>
      </Section>
    </div>
  );
}

