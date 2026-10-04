'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getReport } from '@/lib/services/user/reports';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { normalizeReportData } from '@/lib/utils/report-utils';
import { toast } from 'sonner';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { defaultDateRange } from './report-filters';
import { ReportDataTable } from './report-data-table';
import type { MerchantReportTypeConfig } from '@/config/reports/merchant-report-types';

export interface ReportContentProps {
  config: MerchantReportTypeConfig;
}

export function ReportContent({ config }: ReportContentProps) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => defaultDateRange());

  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const fetchReport = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await getReport(config.apiType, startDate, endDate);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res?.success !== false && res?.data !== undefined) {
            setData(normalizeReportData(res.data, config.slug));
          } else {
            setData([]);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch report:', errorMessage);
          toast.error(errorMessage || 'Failed to load report data');
          setData([]);
        },
      });
    } catch (error) {
      console.error('Report fetch error:', error);
      toast.error('Unexpected error while loading report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = formatDateForAPI(dateRange.from);
      const endDate = formatDateForAPI(dateRange.to);
      fetchReport(startDate, endDate);
    }
  }, [dateRange?.from, dateRange?.to, config.apiType]);

  return (
    <div className="min-w-0 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_55%,#e0f2fe_100%)] p-4 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_55%,#082f49_100%)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
              Insights
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a date range to refresh this report view.
            </p>
          </div>
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            defaultRange={defaultDateRange()}
            placeholder="Select from and to date"
            numberOfMonths={2}
          />
        </div>
      </div>
      <ReportDataTable
        data={data}
        loading={loading}
        title={config.title}
        reportSlug={config.slug}
        emptyMessage="No data available for the selected date range"
      />
    </div>
  );
}
