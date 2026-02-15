'use client';

import { useState } from 'react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

export interface DashboardDateFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const defaultDateRange = (): DateRange => {
  const today = new Date();
  return {
    from: startOfYear(today),
    to: endOfYear(today),
  };
};

export function DashboardDateFilter({ dateRange, onDateRangeChange }: DashboardDateFilterProps) {
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleApply = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      onDateRangeChange(tempDateRange);
      setIsDatePickerOpen(false);
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const handleReset = () => {
    const resetRange = defaultDateRange();
    setTempDateRange(resetRange);
    onDateRangeChange(resetRange);
    setIsDatePickerOpen(false);
  };

  return (
    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <CalendarDays className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
              </>
            ) : (
              format(dateRange.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={tempDateRange?.from}
          selected={tempDateRange}
          onSelect={setTempDateRange}
          numberOfMonths={1}
        />
        <div className="flex items-center justify-end gap-2 border-t p-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
