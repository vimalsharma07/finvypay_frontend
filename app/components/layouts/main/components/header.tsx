'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { GlobalSearchDialog } from '@/partials/dialogs/search/global-search-dialog';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { AdminNotificationsSheet } from '@/partials/topbar/admin-notifications-sheet';
import { MerchantNotificationsSheet } from '@/partials/topbar/merchant-notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { useAdminNotifications } from '@/hooks/use-admin-notifications';
import { useMerchantNotifications } from '@/hooks/use-merchant-notifications';
import {
  Bell,
  Menu,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Container } from '@/components/common/container';
import { Breadcrumb } from './breadcrumb';
import { SidebarMenu } from './sidebar-menu';
import { useAuth } from '@/hooks/use-auth';
import { getMerchantProfiles, type MerchantProfileListResponse } from '@/lib/services/user/merchant-profile';

export function Header() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMac, setIsMac] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const mobileMode = useIsMobile();
  const { user } = useAuth();
  const isUserPath = pathname.startsWith('/user');
  const isAdminPath = pathname.startsWith('/admin');
  
  // Check if current path is a merchant route (dashboard, transactions, etc.)
  const isMerchantRoute = useMemo(() => {
    const merchantRoutes = [
      '/dashboard',
      '/acquirer-accounts',
      '/acquirer-requests',
      '/transactions',
      '/risk-compliance',
      '/routing',
      '/cascading',
      '/support',
      '/payment-links',
      '/profile',
      '/profile-selection',
      '/rates',
      '/config',
      '/wallet',
      '/settings',
      '/reports',
      '/payouts',
      '/settlement',
    ];
    return merchantRoutes.some(route => pathname.startsWith(route));
  }, [pathname]);

  // Fetch admin notification count if on admin path
  const { unreadCount: adminUnreadCount, refresh: refreshAdminNotifications } = useAdminNotifications();
  
  // Fetch merchant notification count if on merchant route
  const { unreadCount: merchantUnreadCount, refresh: refreshMerchantNotifications } = useMerchantNotifications();

  const scrollPosition = useScrollPosition();
  const headerSticky: boolean = scrollPosition > 0;

  const [merchantProfileLabel, setMerchantProfileLabel] = useState<string | null>(null);

  // Prefer full user payload (fallback to localStorage if store user is trimmed)
  const fullUser = useMemo(() => {
    if (user?.merchantProfiles || user?.industry) return user;
    if (typeof window === 'undefined') return user;
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : user;
    } catch {
      return user;
    }
  }, [user]);

  // Load merchant profile label from /merchant/profile/merchant-profiles when on merchant routes
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const resp = await getMerchantProfiles();
        if (resp.status === 200) {
          const payload = resp.data as MerchantProfileListResponse | undefined;
          if (payload?.success && Array.isArray(payload.data) && payload.data.length > 0) {
            const list = payload.data;
            const primary = list.find((p) => p.isPrimary) ?? list[0];
            const label = (primary as any).industryName || primary.merchantProfileName;
            if (label) {
              setMerchantProfileLabel(label);
            }
          } else {
            setMerchantProfileLabel(null);
          }
        }
      } catch {
        // Silently ignore; fallback to user data
        setMerchantProfileLabel(null);
      }
    };
    if (isMerchantRoute) {
      loadProfiles();
    } else {
      setMerchantProfileLabel(null);
    }
  }, [isMerchantRoute, pathname]);

  const merchantLabel = useMemo(() => {
    if (merchantProfileLabel) return merchantProfileLabel;
    const profiles = fullUser?.merchantProfiles;
    if (profiles?.length) {
      const primary = profiles.find((p: any) => p?.isPrimary) ?? profiles[0];
      return (
        primary?.industry?.name ||
        primary?.merchantProfileName ||
        primary?.name ||
        null
      );
    }
    return fullUser?.industry?.name || null;
  }, [fullUser, merchantProfileLabel]);

  // Close sheet when route changes
  useEffect(() => {
    setIsSidebarSheetOpen(false);
  }, [pathname]);

  // Detect Mac platform
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  // Handle CTRL+K / CMD+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (mobileMode) {
          setIsSearchDialogOpen(true);
        } else {
          // Focus the search input or open dialog if not visible
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          } else {
            setIsSearchDialogOpen(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMode]);

  return (
    <header
      className={cn(
        'header fixed top-0 z-50 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background/95 backdrop-blur-sm end-0 pe-(--removed-body-scroll-bar-size,0px)',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        {mobileMode && (
          <div className="flex items-center">
            <Sheet
              open={isSidebarSheetOpen}
              onOpenChange={setIsSidebarSheetOpen}
            >
              <SheetTrigger asChild>
                <Button variant="ghost" mode="icon">
                  <Menu className="text-muted-foreground/70" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="p-0 gap-0 w-[275px]"
                side="left"
                close={false}
              >
                <SheetHeader className="p-0 space-y-0" />
                <SheetBody className="p-0 overflow-y-auto">
                  <SidebarMenu />
                </SheetBody>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Search Input - Desktop */}
        {!mobileMode && (
          <div className="flex-1 max-w-md mx-auto relative z-50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchDialogOpen(true)}
                placeholder="Search..."
                className="pl-9 pr-20 h-9 bg-muted/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary relative z-10"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 z-10">
                <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
              </kbd>
            </div>
          </div>
        )}

        {/* Search Dialog: Admin/Merchant use global search (transactions ± merchants); others use legacy dialog. */}
        {(isAdminPath || isMerchantRoute) && (
          <GlobalSearchDialog
            mode={isAdminPath ? 'admin' : 'merchant'}
            open={isSearchDialogOpen}
            onOpenChange={setIsSearchDialogOpen}
            initialQuery={searchQuery}
          />
        )}
        {!isAdminPath && !isMerchantRoute && (
          <SearchDialog
            open={isSearchDialogOpen}
            onOpenChange={setIsSearchDialogOpen}
          />
        )}

        {/* HeaderTopbar */}
        <div className="flex items-center gap-3 shrink-0 overflow-visible">
          {/* Search - Mobile: icon opens dialog (desktop uses inline input focus) */}
          {mobileMode && (isAdminPath || isMerchantRoute) && (
            <Button
              variant="ghost"
              mode="icon"
              shape="circle"
              className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
              onClick={() => setIsSearchDialogOpen(true)}
            >
              <Search className="size-4.5!" />
            </Button>
          )}
          {mobileMode && !isAdminPath && !isMerchantRoute && (
            <SearchDialog
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                >
                  <Search className="size-4.5!" />
                </Button>
              }
            />
          )}
          {/* Show profile/industry name badge for merchant routes */}
          {isMerchantRoute && merchantLabel && (
            <Link href="/profile-selection" className="hidden sm:inline-flex">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs font-medium whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
              >
                {merchantLabel}
              </Badge>
            </Link>
          )}
          {isAdminPath ? (
            <>
              <AdminNotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary relative overflow-visible"
                  >
                    <Bell className="size-4.5!" />
                    {adminUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-0.5 -right-0.5 min-w-5 h-5 flex items-center justify-center px-1 py-0 text-[10px] font-bold z-10 pointer-events-none"
                      >
                        {adminUnreadCount > 99 ? '99+' : adminUnreadCount}
                      </Badge>
                    )}
                  </Button>
                }
                unreadCount={adminUnreadCount}
                onNotificationUpdate={refreshAdminNotifications}
              />
              <UserDropdownMenu
                trigger={
                  <div className="size-9 rounded-full border-2 border-primary/60 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold uppercase cursor-pointer">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                }
              />
            </>
          ) : isMerchantRoute ? (
            <>
              <MerchantNotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary relative overflow-visible"
                  >
                    <Bell className="size-4.5!" />
                    {merchantUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-0.5 -right-0.5 min-w-5 h-5 flex items-center justify-center px-1 py-0 text-[10px] font-bold z-10 pointer-events-none"
                      >
                        {merchantUnreadCount > 99 ? '99+' : merchantUnreadCount}
                      </Badge>
                    )}
                  </Button>
                }
                unreadCount={merchantUnreadCount}
                onNotificationUpdate={refreshMerchantNotifications}
              />
              <UserDropdownMenu
                trigger={
                  <div className="size-9 rounded-full border-2 border-primary/60 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold uppercase cursor-pointer">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                }
              />
            </>
          ) : isUserPath ? (
            <>
              <NotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <Bell className="size-4.5!" />
                  </Button>
                }
              />
              <UserDropdownMenu
                trigger={
                  <div className="size-9 rounded-full border-2 border-primary/60 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold uppercase cursor-pointer">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                }
              />
            </>
          ) : (
            <>
              <NotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <Bell className="size-4.5!" />
                  </Button>
                }
              />
              <UserDropdownMenu
                trigger={
                  <div className="size-9 rounded-full border-2 border-primary/60 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold uppercase cursor-pointer">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                }
              />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
