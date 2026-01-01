'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { AppsDropdownMenu } from '@/partials/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import {
  Bell,
  LayoutGrid,
  Menu,
  MessageCircleMore,
  Search,
  SquareChevronRight,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Container } from '@/components/common/container';
import { Breadcrumb } from './breadcrumb';
import { MegaMenu } from './mega-menu';
import { MegaMenuMobile } from './mega-menu-mobile';
import { SidebarMenu } from './sidebar-menu';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [isMegaMenuSheetOpen, setIsMegaMenuSheetOpen] = useState(false);

  const pathname = usePathname();
  const mobileMode = useIsMobile();
  const { user } = useAuth();
  const isUserPath = pathname.startsWith('/user');

  const scrollPosition = useScrollPosition();
  const headerSticky: boolean = scrollPosition > 0;

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

  const merchantLabel = useMemo(() => {
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
  }, [fullUser]);

  // Close sheet when route changes
  useEffect(() => {
    setIsSidebarSheetOpen(false);
    setIsMegaMenuSheetOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-(--removed-body-scroll-bar-size,0px)',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        {/* HeaderLogo */}
        <div className="flex lg:hidden items-center gap-2.5">
          <Link href="/" className="shrink-0">
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-[25px] w-full"
              alt="mini-logo"
            />
          </Link>
          <div className="flex items-center">
            {mobileMode && (
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
            )}
            {mobileMode && (
              <Sheet
                open={isMegaMenuSheetOpen}
                onOpenChange={setIsMegaMenuSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" mode="icon">
                    <SquareChevronRight className="text-muted-foreground/70" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="p-0 gap-0 w-[275px]"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="p-0 overflow-y-auto">
                    <MegaMenuMobile />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Main Content (MegaMenu or Breadcrumbs) */}
        {isUserPath ? null : !mobileMode && <MegaMenu />}

        {/* HeaderTopbar */}
        <div className="flex items-center gap-3 ms-auto">
          {isUserPath ? (
            <>
              {!mobileMode && (
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
              {merchantLabel && (
                <Link href="/user/profile-selection" className="hidden sm:inline-flex">
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs font-medium whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    {merchantLabel}
                  </Badge>
                </Link>
              )}
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
              {!mobileMode && (
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
              <ChatSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <MessageCircleMore className="size-4.5!" />
                  </Button>
                }
              />
              <AppsDropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <LayoutGrid className="size-4.5!" />
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
