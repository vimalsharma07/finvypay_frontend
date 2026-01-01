'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { DateRange as CommonDateRange } from '@/lib/types/common-types';

export type DateRange = CommonDateRange;

interface DateRangePickerProps {
  initialRange?: CommonDateRange | null;
  onChange?: (range: CommonDateRange | null) => void;
}

/**
 * Lightweight date range picker built from two native date inputs.
 * Designed to keep parity with the previous API signature.
 */
export function DateRangePicker({ initialRange = null, onChange }: DateRangePickerProps) {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  // Initialize from props
  useEffect(() => {
    if (initialRange?.startDate) {
      setStart(new Date(initialRange.startDate).toISOString().slice(0, 10));
    }
    if (initialRange?.endDate) {
      setEnd(new Date(initialRange.endDate).toISOString().slice(0, 10));
    }
  }, [initialRange]);

  // Notify parent on change when both dates exist
  useEffect(() => {
    if (!onChange) return;

    if (start && end) {
      onChange({
        startDate: new Date(start),
        endDate: new Date(end),
      });
    } else if (!start && !end) {
      onChange(null);
    }
  }, [start, end, onChange]);

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="text-xs md:text-sm"
      />
      <Input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="text-xs md:text-sm"
      />
    </div>
  );
}

