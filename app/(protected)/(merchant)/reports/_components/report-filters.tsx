'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

export interface ReportFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function defaultDateRange(): DateRange {
  const today = new Date();
  return {
    from: startOfMonth(today),
    to: endOfMonth(today),
  };
}

export function ReportFilters({
  dateRange,
  onDateRangeChange,
}: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);

  useEffect(() => {
    if (isOpen) {
      setTempRange(dateRange);
    }
  }, [isOpen, dateRange]);

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      onDateRangeChange(tempRange);
      setIsOpen(false);
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const handleReset = () => {
    setTempRange(defaultDateRange());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Date Range Filter</span>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarDays className="mr-1 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
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
                defaultMonth={tempRange?.from || new Date()}
                selected={tempRange}
                onSelect={setTempRange}
                numberOfMonths={1}
              />
              <div className="flex items-center justify-end gap-2 border-t border-border p-3">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
