import { Section, ApiEndpoint, CodeBlock, ResponseExample, Note } from '../components/api-endpoint';

export default function CryptoPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Crypto Payments API</h1>
        <p className="text-xl text-muted-foreground">
          Accept cryptocurrency payments, create crypto payment links, and process crypto exchanges.
        </p>
      </div>

      <Section title="Crypto Payment Link (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/crypto/payment-link"
          description="Creates a crypto payment link with wallet address and QR code for customers to send cryptocurrency."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "cryptoCurrency": "BTC",
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
                  <td className="p-2 font-mono text-xs">cryptoCurrency</td>
                  <td className="p-2">string</td>
                  <td className="p-2">No</td>
                  <td className="p-2">Crypto currency code (BTC, ETH, etc.)</td>
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
                paymentLinkId: 'CRYPTO-LINK-20240101-ABC123',
                paymentLink: 'https://pay.pay4tech.com/crypto/CRYPTO-LINK-20240101-ABC123',
                walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                qrCode: 'https://pay.pay4tech.com/qr/CRYPTO-LINK-20240101-ABC123',
                cryptoAmount: 0.0025,
                cryptoCurrency: 'BTC',
                amount: 100.50,
                currency: 'USD',
              },
            }}
          />

          <Note type="info">
            Share the <code>paymentLink</code> or <code>qrCode</code> with your customer. They can send cryptocurrency
            to the provided <code>walletAddress</code> to complete the payment.
          </Note>
        </ApiEndpoint>
      </Section>

      <Section title="Crypto Exchange/On-Ramp (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/crypto"
          description="Processes crypto exchange or on-ramp transaction."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "cryptoCurrency": "BTC",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Crypto Exchange (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/crypto"
          description="Processes crypto exchange in sandbox mode for testing."
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
  "cryptoCurrency": "BTC",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Crypto Payin (Production)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/crypto/payin"
          description="Processes crypto payin transaction."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <CodeBlock
            code={`{
  "orderId": "ORD-12345",
  "amount": 100.50,
  "currency": "USD",
  "merchantProfileId": 1,
  "cryptoCurrency": "BTC",
  "webhookUrl": "https://your-domain.com/webhook"
}`}
          />
        </ApiEndpoint>
      </Section>

      <Section title="Crypto Payin (Sandbox)">
        <ApiEndpoint
          method="POST"
          path="/api/v1/sandbox/crypto/payin"
          description="Processes crypto payin in sandbox mode for testing."
          requiresApiKey={true}
        >
          <h4 className="font-semibold mb-2">Request Body</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Same request body as production endpoint.
          </p>
        </ApiEndpoint>
      </Section>

      <Section title="Get Crypto Currencies">
        <ApiEndpoint
          method="POST"
          path="/api/v1/production/crypto/currencies"
          description="Returns list of supported cryptocurrencies."
          requiresApiKey={true}
        >
          <ResponseExample
            title="Success Response"
            status={200}
            response={{
              success: true,
              data: {
                currencies: [
                  {
                    code: 'BTC',
                    name: 'Bitcoin',
                    symbol: '₿',
                    minAmount: 0.0001,
                  },
                  {
                    code: 'ETH',
                    name: 'Ethereum',
                    symbol: 'Ξ',
                    minAmount: 0.001,
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

