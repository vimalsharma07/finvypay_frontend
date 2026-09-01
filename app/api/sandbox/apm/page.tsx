import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { SandboxApmContent } from './sandbox-apm-content';

function SandboxApmFallback() {
  return (
    <main className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4 py-12">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading sandbox payment...</span>
      </div>
    </main>
  );
}

export default function SandboxApmPage() {
  return (
    <Suspense fallback={<SandboxApmFallback />}>
      <SandboxApmContent />
    </Suspense>
  );
}
