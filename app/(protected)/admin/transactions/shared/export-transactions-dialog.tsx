'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarRange, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import type { DateRange } from 'react-day-picker';

interface ExportTransactionsDialogProps {
  /** Optional label for the trigger button */
  label?: string;
  /** Called with ISO date strings (yyyy-MM-dd) when user confirms export */
  onExport: (params: { startDate: string; endDate: string }) => Promise<void>;
}

export function ExportTransactionsDialog({
  label = 'Export',
  onExport,
}: ExportTransactionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!range?.from || !range?.to || submitting) return;
    const startDate = format(range.from, 'yyyy-MM-dd');
    const endDate = format(range.to, 'yyyy-MM-dd');

    setSubmitting(true);
    try {
      await onExport({ startDate, endDate });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const canExport = !!range?.from && !!range?.to && !submitting;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Download className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              Export transactions
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a date range for the transactions you want to export. You’ll receive a CSV file download.
            </p>
            <DateRangeFilter
              value={range}
              onChange={setRange}
              placeholder="Select date range"
              numberOfMonths={2}
              size="sm"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!canExport}
            >
              {submitting ? 'Exporting...' : 'Export'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

