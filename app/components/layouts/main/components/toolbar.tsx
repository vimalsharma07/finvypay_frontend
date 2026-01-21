'use client';

import { Fragment, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import { useRoleBasedMenu } from '@/hooks/use-role-based-menu';

export interface ToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  icon?: LucideIcon;
}

function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 pb-7.5">
      {children}
    </div>
  );
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex items-center gap-2.5">{children}</div>;
}

function ToolbarBreadcrumbs() {
  const pathname = usePathname();
  const menu = useRoleBasedMenu();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items: MenuItem[] = getBreadcrumb(menu);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
      <div className="breadcrumb flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const active = item.path ? isActive(item.path) : false;

          return (
            <Fragment key={index}>
              {item.path ? (
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-1',
                    active
                      ? 'text-mono'
                      : 'text-muted-foreground hover:text-primary',
                  )}
                >
                  {item.title}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'text-mono' : 'text-muted-foreground')}
                >
                  {item.title}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 muted-foreground" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ToolbarHeading({ title = '', description, icon }: ToolbarHeadingProps) {
  const pathname = usePathname();
  const menu = useRoleBasedMenu();
  const { getCurrentItem, getBreadcrumb } = useMenu(pathname);
  const item = getCurrentItem(menu);
  const breadcrumb = getBreadcrumb(menu);

  // Get icon from prop, current menu item, or parent menu item from breadcrumb
  let IconComponent = icon;
  if (!IconComponent && item) {
    IconComponent = item.icon;
  }
  // If no icon in current item, try to get from parent in breadcrumb
  if (!IconComponent && breadcrumb.length > 1) {
    // Get parent item (second to last in breadcrumb)
    const parentItem = breadcrumb[breadcrumb.length - 2];
    IconComponent = parentItem?.icon;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Module Icon */}
      {IconComponent && (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
            <IconComponent className="size-6" />
          </div>
        </div>
      )}

      {/* Title and Description */}
      <div className="flex flex-col justify-center gap-1 flex-1">
        <h1 className="text-xl font-semibold leading-tight text-foreground">
          {title || item?.title || 'Untitled'}
        </h1>
        {description && (
          <p className="text-sm font-normal text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };
