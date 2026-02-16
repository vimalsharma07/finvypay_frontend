'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export interface DateRangeFilterProps {
  /** Current date range value */
  value?: DateRange | undefined;
  /** Called when user applies or clears the range */
  onChange: (range: DateRange | undefined) => void;
  /** Placeholder when no range selected */
  placeholder?: string;
  /** Range to use when "Clear" is clicked. If not set, Clear sets value to undefined */
  defaultRange?: DateRange | undefined;
  /** Number of calendar months to show (1 or 2). 2 gives airline-style side-by-side */
  numberOfMonths?: 1 | 2;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Trigger button class name */
  className?: string;
  /** Trigger width class (e.g. w-[280px] or min-w-[260px]) */
  triggerClassName?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size of the trigger button */
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const defaultPlaceholder = 'Select from and to date';

/**
 * Reusable date range filter (from – to) with Clear and Apply.
 * Use for dashboards, logs, reports. Theme-aligned; supports 1 or 2 calendar months.
 */
export function DateRangeFilter({
  value,
  onChange,
  placeholder = defaultPlaceholder,
  defaultRange,
  numberOfMonths = 2,
  minDate,
  maxDate,
  className,
  triggerClassName,
  disabled = false,
  size = 'md',
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value);

  // Sync temp range when popover opens or when value changes from outside
  useEffect(() => {
    if (open) {
      setTempRange(value ?? defaultRange);
    }
  }, [open, value, defaultRange]);

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      onChange(tempRange);
      setOpen(false);
    }
    // If only one date selected, keep popover open (user can select end date)
  };

  const handleClear = () => {
    const next = defaultRange ?? undefined;
    setTempRange(next);
    onChange(next);
    setOpen(false);
  };

  const displayText =
    value?.from && value?.to
      ? `${format(value.from, 'MMM dd, yyyy')} – ${format(value.to, 'MMM dd, yyyy')}`
      : placeholder;

  const hasValidRange = Boolean(tempRange?.from && tempRange?.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal bg-background border-border hover:bg-muted/50 hover:border-primary/30 transition-colors',
            triggerClassName ?? 'min-w-[260px] sm:w-[300px]',
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className={cn(!value?.from && 'text-muted-foreground')}>
            {displayText}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-border bg-popover shadow-lg rounded-lg overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select date range
          </p>
          {tempRange?.from && (
            <p className="text-sm mt-1 text-foreground">
              {tempRange.to
                ? `${format(tempRange.from, 'MMM d, yyyy')} – ${format(tempRange.to, 'MMM d, yyyy')}`
                : `From ${format(tempRange.from, 'MMM d, yyyy')} — select end date`}
            </p>
          )}
        </div>
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={tempRange}
          onSelect={setTempRange}
          defaultMonth={tempRange?.from ?? value?.from ?? new Date()}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
        <div className="flex items-center justify-between gap-2 border-t border-border p-3 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!hasValidRange}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
