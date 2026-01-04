import { Metadata } from 'next';
import { CardForm } from './components/card-form';

export const metadata: Metadata = {
  title: 'Card Payment',
};

export default function CardPage() {
  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="mb-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                Card payment
              </p>
              <p className="text-xs text-muted-foreground">
                Enter your card details securely
              </p>
            </div>
          </div>
        </div>
        <CardForm />
      </div>
    </main>
  );
}


