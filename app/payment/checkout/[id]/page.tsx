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
    <main className="min-h-screen w-full bg-muted/30 flex flex-col items-center">
      <div className="w-full bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="mx-auto flex h-56 w-full max-w-4xl items-center gap-3 px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">
            P4
          </div>
          <div>
            <p className="text-2xl font-semibold leading-tight">FinvyPay Checkout</p>
            <p className="text-sm text-white/80">Securely collect payer details</p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center -mt-16 px-4 pb-16">
        <div className="w-full max-w-2xl">
          <CheckoutForm paymentLinkId={paymentLinkId} />
        </div>
      </div>
    </main>
  );
}


