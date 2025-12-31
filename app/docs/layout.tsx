'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  FileText, 
  Wallet, 
  ArrowLeftRight, 
  Link as LinkIcon, 
  Coins, 
  RefreshCw,
  Search,
  BookOpen,
  Home,
  LogIn,
  ArrowUp
} from 'lucide-react';

const docsNavItems = [
  { href: '/docs', label: 'Overview', icon: BookOpen },
  { href: '/docs/card-payments', label: 'Card Payments', icon: CreditCard },
  { href: '/docs/apm-payments', label: 'APM Payments', icon: FileText },
  { href: '/docs/payouts', label: 'Payouts', icon: Wallet },
  { href: '/docs/wallet', label: 'Wallet', icon: Wallet },
  { href: '/docs/refunds', label: 'Refunds', icon: RefreshCw },
  { href: '/docs/payment-links', label: 'Payment Links', icon: LinkIcon },
  { href: '/docs/crypto', label: 'Crypto Payments', icon: Coins },
  { href: '/docs/transactions', label: 'Transactions', icon: Search },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down more than 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background w-full relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mx-auto">
            <Link href="/docs" className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Pay4Tech API Docs</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 py-8 pt-24">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-28 space-y-1">
              {docsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/docs' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content - Centered with constrained width */}
          <main className="flex-1 min-w-0 flex justify-center">
            <div className="w-full prose prose-slate dark:prose-invert">
              <div className="max-w-4xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="w-full px-4 py-8 text-center text-sm text-muted-foreground">
          <div className="max-w-7xl mx-auto">
            <p>&copy; {new Date().getFullYear()} Pay4Tech. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

