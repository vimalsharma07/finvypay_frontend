'use client';

import { EllipsisVertical, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export interface TableActionMenuItem<T> {
  label: string;
  route?: (row: T) => string;
  onClick?: (row: T) => void;
  variant?: 'destructive' | 'default';
  separator?: boolean;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface TableActionMenuProps<T> {
  row: T;
  actions: TableActionMenuItem<T>[];
}

/**
 * Reusable table action menu component
 * Displays a dropdown menu with three dots icon, matching the transactions page pattern
 */
export function TableActionMenu<T extends Record<string, any>>({
  row,
  actions,
}: TableActionMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-[180px]">
        {actions.map((action, index) => {
          const shouldShowSeparator = action.separator && index > 0;
          const IconComponent = action.icon;

          if (action.route) {
            return (
              <div key={index}>
                {shouldShowSeparator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  asChild
                  disabled={action.disabled}
                  className={action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
                >
                  <Link href={action.route(row)} className="flex items-center gap-1">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              </div>
            );
          }

          return (
            <div key={index}>
              {shouldShowSeparator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => action.onClick?.(row)}
                disabled={action.disabled}
                className={
                  action.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive focus:bg-destructive/10'
                    : ''
                }
              >
                <div className="flex items-center gap-1">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {action.label}
                </div>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

