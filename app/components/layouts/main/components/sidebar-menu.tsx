'use client';

import { JSX, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { useRoleBasedMenu } from '@/hooks/use-role-based-menu';
import { MenuConfig, MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { Badge } from '@/components/ui/badge';

// Helper function to check if a URL is external
const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

export function SidebarMenu() {
  const pathname = usePathname();
  const menu = useRoleBasedMenu();

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'lg:ps-1 space-y-3',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-8 hover:bg-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-muted data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.heading) {
        return buildMenuHeading(item, index);
      } else if (item.disabled) {
        return buildMenuItemRootDisabled(item, index);
      } else {
        return buildMenuItemRoot(item, index);
      }
    });
  };

  const buildMenuItemRoot = (item: MenuItem, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-medium flex items-center gap-1">
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="shrink-0" />}
            <span data-slot="accordion-menu-title" className="flex-1 text-left">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      const path = item.path || '#';
      const isExternal = isExternalUrl(path);
      
      return (
        <AccordionMenuItem
          key={index}
          value={path}
          className="text-sm font-medium"
          onClick={isExternal ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(path, '_blank', 'noopener,noreferrer');
          } : undefined}
        >
          {isExternal ? (
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(path, '_blank', 'noopener,noreferrer');
              }}
            >
              {item.icon && <item.icon data-slot="accordion-menu-icon" className="shrink-0" />}
              <span data-slot="accordion-menu-title" className="flex-1 text-left">{item.title}</span>
              <ExternalLink className="shrink-0 size-3.5 text-muted-foreground" />
            </a>
          ) : (
            <Link
              href={path}
              className="flex items-center gap-1"
            >
              {item.icon && <item.icon data-slot="accordion-menu-icon" className="shrink-0" />}
              <span data-slot="accordion-menu-title" className="flex-1 text-left">{item.title}</span>
            </Link>
          )}
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemRootDisabled = (
    item: MenuItem,
    index: number,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-${index}`}
        className="text-sm font-medium"
      >
        {item.icon && <item.icon data-slot="accordion-menu-icon" />}
        <span data-slot="accordion-menu-title">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            Soon
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuItemChildren = (
    items: MenuConfig,
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[13px]">
            {item.collapse ? (
              <span className="text-muted-foreground">
                <span className="hidden [[data-state=open]>span>&]:inline">
                  {item.collapseTitle}
                </span>
                <span className="inline [[data-state=open]>span>&]:hidden">
                  {item.expandTitle}
                </span>
              </span>
            ) : (
              item.title
            )}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      const path = item.path || '#';
      const isExternal = isExternalUrl(path);
      
      return (
        <AccordionMenuItem
          key={index}
          value={path}
          className="text-[13px]"
          onClick={isExternal ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(path, '_blank', 'noopener,noreferrer');
          } : undefined}
        >
          {isExternal ? (
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(path, '_blank', 'noopener,noreferrer');
              }}
            >
              <span>{item.title}</span>
              <ExternalLink className="shrink-0 size-3 text-muted-foreground" />
            </a>
          ) : (
            <Link href={path}>{item.title}</Link>
          )}
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildDisabled = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-child-${level}-${index}`}
        className="text-[13px]"
      >
        <span data-slot="accordion-menu-title">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            Soon
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuHeading = (item: MenuItem, index: number): JSX.Element => {
    return <AccordionMenuLabel key={index}>{item.heading}</AccordionMenuLabel>;
  };

  return (
    <div className="kt-scrollable-y-hover flex grow shrink-0 py-5 px-5 lg:max-h-[calc(100vh-5.5rem)]">
      <AccordionMenu
        selectedValue={pathname}
        matchPath={matchPath}
        type="single"
        collapsible
        classNames={classNames}
      >
        {buildMenu(menu)}
      </AccordionMenu>
    </div>
  );
}
