import { Metadata } from 'next';
import { OtpForm } from './components/otp-form';

export const metadata: Metadata = {
  title: 'Card OTP Verification',
};

export default function OtpPage() {
  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
            Card otp
          </p>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent for your card
          </p>
        </div>
        <OtpForm />
      </div>
    </main>
  );
}


