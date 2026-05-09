'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateRange as CommonDateRange } from '@/lib/types/common-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type DateRange = CommonDateRange;

interface DateRangePickerProps {
  initialRange?: CommonDateRange | null;
  onChange?: (range: CommonDateRange | null) => void;
  className?: string;
  maxDate?: Date;
}

type InternalRange = { startDate: Date | null; endDate: Date | null };

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function formatDisplayDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function buildYearOptions(centerYear: number, span = 25) {
  const start = centerYear - Math.floor(span / 2);
  return Array.from({ length: span }, (_, i) => start + i);
}

function getDaysGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];
  const prefix = firstDay.getDay(); // 0-6
  for (let i = prefix - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const total = 42; // 6 weeks grid
  const suffix = total - days.length;
  for (let i = 1; i <= suffix; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

/**
 * Custom date range picker with month/year dropdowns and dual calendars.
 */
export function DateRangePicker({
  initialRange = null,
  onChange,
  className,
  maxDate,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [range, setRange] = useState<InternalRange>({
    startDate: toDate(initialRange?.startDate),
    endDate: toDate(initialRange?.endDate),
  });
  const [isSelecting, setIsSelecting] = useState(false);

  // Sync external changes
  useEffect(() => {
    setRange({
      startDate: toDate(initialRange?.startDate),
      endDate: toDate(initialRange?.endDate),
    });
  }, [initialRange?.startDate, initialRange?.endDate]);

  const displayValue = useMemo(() => {
    if (range.startDate && range.endDate) {
      return `${formatDisplayDate(range.startDate)} - ${formatDisplayDate(range.endDate)}`;
    }
    if (range.startDate) return formatDisplayDate(range.startDate);
    return 'Select date range';
  }, [range.startDate, range.endDate]);

  const isDisabled = useCallback(
    (date: Date) => (maxDate ? date > maxDate : false),
    [maxDate]
  );

  const isInRange = useCallback(
    (date: Date) => {
      if (!range.startDate || !range.endDate) return false;
      return date >= range.startDate && date <= range.endDate;
    },
    [range.startDate, range.endDate]
  );

  const isSelected = useCallback(
    (date: Date) =>
      date.toDateString() === range.startDate?.toDateString() ||
      date.toDateString() === range.endDate?.toDateString(),
    [range.startDate, range.endDate]
  );

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;

    if (!isSelecting || !range.startDate) {
      setRange({ startDate: date, endDate: null });
      setIsSelecting(true);
      return;
    }

    let startDate = range.startDate;
    let endDate = date;
    if (endDate < startDate) {
      [startDate, endDate] = [endDate, startDate];
    }
    setRange({ startDate, endDate });
    setIsSelecting(false);
    onChange?.({ startDate, endDate });
    setOpen(false);
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + (dir === 'next' ? 1 : -1), 1));
  };

  const renderCalendar = (monthDate: Date) => {
    const years = buildYearOptions(monthDate.getFullYear(), 25);
    const days = getDaysGrid(monthDate);

    return (
      <div className="p-3 w-[300px]">
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            type="button"
            className="p-2 hover:text-foreground text-muted-foreground"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            <Select
              value={monthDate.getMonth().toString()}
              onValueChange={(val) =>
                setCurrentMonth(new Date(monthDate.getFullYear(), parseInt(val, 10), 1))
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, idx) => (
                  <SelectItem key={m} value={idx.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={monthDate.getFullYear().toString()}
              onValueChange={(val) =>
                setCurrentMonth(new Date(parseInt(val, 10), monthDate.getMonth(), 1))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            className="p-2 hover:text-foreground text-muted-foreground"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {days.map((day, idx) => {
            const outside =
              day.getMonth() !== monthDate.getMonth() || day.getFullYear() !== monthDate.getFullYear();
            const disabled = isDisabled(day);
            const selected = !disabled && isSelected(day);
            const inRange = !disabled && isInRange(day) && !selected;

            return (
              <button
                type="button"
                key={`${day.toISOString()}-${idx}`}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'h-9 w-9 rounded text-sm flex items-center justify-center transition-colors',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  selected && 'bg-primary text-primary-foreground',
                  inRange && 'bg-accent/60 text-foreground',
                  isToday(day) && !selected && 'border border-primary',
                  outside && !selected && 'text-muted-foreground/60'
                )}
                disabled={disabled}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    [currentMonth]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm font-normal text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2',
            !range.startDate && 'text-muted-foreground',
            className
          )}
        >
          <span>{displayValue}</span>
          <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col lg:flex-row">
          {renderCalendar(currentMonth)}
          <div className="hidden lg:block">{renderCalendar(nextMonth)}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Format Date to YYYY-MM-DD */
function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface SingleDatePickerProps {
  /** Value as YYYY-MM-DD or null */
  value?: string | null;
  onChange?: (value: string | null) => void;
  className?: string;
  placeholder?: string;
  maxDate?: Date;
}

/**
 * Single date picker matching DateRangePicker theme (calendar grid, month/year selects, Clear/Today).
 */
export function SingleDatePicker({
  value = null,
  onChange,
  className,
  placeholder = 'Select date',
  maxDate,
}: SingleDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = toDate(value);
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  const isDisabled = useCallback(
    (date: Date) => (maxDate ? date > maxDate : false),
    [maxDate]
  );

  const isSelected = useCallback(
    (date: Date) => selectedDate?.toDateString() === date.toDateString(),
    [selectedDate]
  );

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;
    onChange?.(toYYYYMMDD(date));
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.(null);
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    if (!maxDate || today <= maxDate) {
      onChange?.(toYYYYMMDD(today));
      setOpen(false);
    }
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + (dir === 'next' ? 1 : -1), 1));
  };

  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : placeholder;

  const renderCalendar = (monthDate: Date) => {
    const years = buildYearOptions(monthDate.getFullYear(), 25);
    const days = getDaysGrid(monthDate);

    return (
      <div className="p-3 w-[300px]">
        <div className="flex items-center justify-between mb-3 gap-2">
          <button
            type="button"
            className="p-2 hover:text-foreground text-muted-foreground rounded-md hover:bg-accent"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            <Select
              value={monthDate.getMonth().toString()}
              onValueChange={(val) =>
                setCurrentMonth(new Date(monthDate.getFullYear(), parseInt(val, 10), 1))
              }
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, idx) => (
                  <SelectItem key={m} value={idx.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={monthDate.getFullYear().toString()}
              onValueChange={(val) =>
                setCurrentMonth(new Date(parseInt(val, 10), monthDate.getMonth(), 1))
              }
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            className="p-2 hover:text-foreground text-muted-foreground rounded-md hover:bg-accent"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {days.map((day, idx) => {
            const outside =
              day.getMonth() !== monthDate.getMonth() || day.getFullYear() !== monthDate.getFullYear();
            const disabled = isDisabled(day);
            const selected = !disabled && isSelected(day);

            return (
              <button
                type="button"
                key={`${day.toISOString()}-${idx}`}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'h-9 w-9 rounded text-sm flex items-center justify-center transition-colors',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  selected && 'bg-primary text-primary-foreground',
                  isToday(day) && !selected && 'border border-primary',
                  outside && !selected && 'text-muted-foreground/60'
                )}
                disabled={disabled}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3 mt-3">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={handleToday}
          >
            Today
          </button>
        </div>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm font-normal text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <span>{displayValue}</span>
          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {renderCalendar(currentMonth)}
      </PopoverContent>
    </Popover>
  );
}

