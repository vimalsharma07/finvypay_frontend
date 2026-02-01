'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getReport } from '@/lib/services/user/reports';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { normalizeReportData } from '@/lib/utils/report-utils';
import { toast } from 'sonner';
import { ReportFilters, defaultDateRange } from './report-filters';
import { ReportDataTable } from './report-data-table';
import type { MerchantReportTypeConfig } from '@/config/reports/merchant-report-types';

export interface ReportContentProps {
  config: MerchantReportTypeConfig;
}

export function ReportContent({ config }: ReportContentProps) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);

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
    <div className="space-y-6">
      <ReportFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
      <ReportDataTable
        data={data}
        loading={loading}
        title={config.title}
        emptyMessage="No data available for the selected date range"
      />
    </div>
  );
}
