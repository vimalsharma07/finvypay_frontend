'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getReport } from '@/lib/services/admin/reports';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { normalizeReportData } from '@/lib/utils/report-utils';
import { toast } from 'sonner';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { defaultDateRange } from './report-filters';
import { ReportDataTable } from './report-data-table';
import type { AdminReportTypeConfig } from '@/config/reports/admin-report-types';
import { Filter } from '@/components/common/Filter';
import {
  FieldTypes,
  FilterFields,
  FiltersSchema,
  Option,
} from '@/lib/types/common-types';
import { generateFilterQuery } from '@/lib/helpers';
import { getAllMerchantsPaginated } from '@/lib/services/admin/users';

export interface ReportContentProps {
  config: AdminReportTypeConfig;
  filterOpen?: boolean;
  setFilterOpen?: (open: boolean) => void;
}

/** Map advanced filter state to GET /admin/report query extras (backend: merchant_id, …). */
function merchantExtrasFromFilters(
  filters: FilterFields
): { merchant_id: string } | undefined {
  const q = generateFilterQuery(filters);
  const raw = q.merchant_id;
  if (raw === undefined || raw === null || raw === '') return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  return { merchant_id: s };
}

export function ReportContent({
  config,
  filterOpen: externalFilterOpen,
  setFilterOpen: externalSetFilterOpen,
}: ReportContentProps) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => defaultDateRange());
  const [advancedFilters, setAdvancedFilters] = useState<FilterFields>({});
  const [merchantOptions, setMerchantOptions] = useState<Option[]>([]);
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);

  const filterOpen =
    externalFilterOpen !== undefined ? externalFilterOpen : internalFilterOpen;
  const setFilterOpen = externalSetFilterOpen ?? setInternalFilterOpen;

  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const fetchReport = useCallback(
    async (
      startDate: string,
      endDate: string,
      extras?: { merchant_id: string }
    ) => {
      setLoading(true);
      try {
        const response = await getReport(config.apiType, startDate, endDate, extras);
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
    },
    [config.apiType, config.slug]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const merchants = await getAllMerchantsPaginated();
        if (cancelled || !Array.isArray(merchants)) return;
        setMerchantOptions(
          merchants.map((user) => ({
            label: user.name || user.email || user.id,
            value: String(user.id),
          }))
        );
      } catch (e) {
        console.error('Failed to load merchants for report filter', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;
    const startDate = formatDateForAPI(dateRange.from);
    const endDate = formatDateForAPI(dateRange.to);
    const extras = merchantExtrasFromFilters(advancedFilters);
    void fetchReport(startDate, endDate, extras);
  }, [dateRange?.from, dateRange?.to, advancedFilters, fetchReport]);

  const handleApplyAdvancedFilters = useCallback((applied: FilterFields) => {
    setAdvancedFilters(applied);
  }, []);

  const filtersSchema: FiltersSchema[] = useMemo(
    () => [
      {
        field: 'merchant_id',
        label: 'Merchant',
        type: FieldTypes.multiSelect,
        options: merchantOptions,
        multiSelectSize: 'comfortable',
      },
    ],
    [merchantOptions]
  );

  const reportBasePath = `/admin/reports/${config.slug}`;

  return (
    <Fragment>
      <div className="space-y-6 min-w-0">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            defaultRange={defaultDateRange()}
            placeholder="Select from and to date"
            numberOfMonths={2}
          />
        </div>
        <ReportDataTable
          data={data}
          loading={loading}
          title={config.title}
          reportSlug={config.slug}
          emptyMessage="No data available for the selected date range"
        />
      </div>

      <Filter
        filtersSchema={filtersSchema}
        onApplyFilters={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
        open={filterOpen}
        setOpen={setFilterOpen}
        baseUrl={reportBasePath}
      />
    </Fragment>
  );
}
