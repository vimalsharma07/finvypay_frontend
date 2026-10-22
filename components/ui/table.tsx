'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div data-slot="table-wrapper" className="relative w-full overflow-auto">
      <table data-slot="table" className={cn('w-full caption-bottom text-foreground text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'bg-sky-50/70 [&_tr]:border-b [&_tr]:border-sky-100 dark:bg-sky-950/35 dark:[&_tr]:border-sky-900/50',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody data-slot="table-body" className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium last:[&>tr]:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-sky-100/70 transition-colors odd:bg-sky-50/30 [&:has(td):hover]:bg-sky-100/50 data-[state=selected]:bg-sky-100/60 dark:border-sky-900/40 dark:odd:bg-sky-950/20 dark:[&:has(td):hover]:bg-sky-950/40',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-11 px-4 text-left rtl:text-right align-middle text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400 [&:has([role=checkbox])]:pe-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td data-slot="table-cell" className={cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pe-0', className)} {...props} />
  );
}

function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption data-slot="table-caption" className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
