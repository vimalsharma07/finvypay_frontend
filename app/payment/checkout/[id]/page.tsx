import { Metadata } from 'next';
import { CheckoutForm } from './components/checkout-form';

export const metadata: Metadata = {
  title: 'Checkout',
};

interface CheckoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  const paymentLinkId = id;

  return (
    <main className="min-h-screen w-full bg-slate-100 py-8">
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-6xl">
          <CheckoutForm paymentLinkId={paymentLinkId} />
        </div>
      </div>
    </main>
  );
}


