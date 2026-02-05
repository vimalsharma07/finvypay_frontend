'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getProductionTransactions,
  processChargeback,
  processRefund,
  markSuspicious,
  Transaction,
  TransactionListResponse,
} from '@/lib/services/admin/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SearchInput } from '../shared/search-input';
import { getTransactionColumns } from '../shared/columns';
import { filterTransactions } from '../shared/utils';
import {
  DynamicTransactionDetailsDialog,
  DynamicChargebackDialog,
  DynamicRefundDialog,
  DynamicSuspiciousDialog,
} from '@/components/dialogs';
import { Filter } from '@/components/common/Filter';
import {
  FieldTypes,
  FilterFields,
  FiltersSchema,
  Option,
} from '@/lib/types/common-types';
import { generateFilterQuery } from '@/lib/helpers';
import { getMerchants } from '@/lib/services/admin/users';
import { getUserConnectors } from '@/lib/services/admin/connectors';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useCountries } from '@/lib/hooks/use-countries';
import { getTimeZones } from '@/i18n/timezones';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

interface TransactionsPageContentProps {
  filterOpen?: boolean;
  setFilterOpen?: (open: boolean) => void;
}

export function TransactionsPageContent({ filterOpen: externalFilterOpen, setFilterOpen: externalSetFilterOpen }: TransactionsPageContentProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['data']['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [chargebackDialogOpen, setChargebackDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [suspiciousDialogOpen, setSuspiciousDialogOpen] = useState(false);
  const [transactionForAction, setTransactionForAction] = useState<Transaction | null>(null);
  const [processingChargeback, setProcessingChargeback] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingSuspicious, setProcessingSuspicious] = useState(false);
  const [filters, setFilters] = useState<FilterFields>({});
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);
  
  // Use external filter state if provided, otherwise use internal
  const filterOpen = externalFilterOpen !== undefined ? externalFilterOpen : internalFilterOpen;
  const setFilterOpen = externalSetFilterOpen || setInternalFilterOpen;

  // Dropdown options
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [connectorOptions, setConnectorOptions] = useState<Option[]>([]);
  const { currencies } = useCurrencies();
  const { countries } = useCountries();
  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        label: currency.code,
        value: currency.code,
      })),
    [currencies]
  );
  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        label: country.countryName,
        value: country.isoTwo,
      })),
    [countries]
  );
  const timeZoneOptions = useMemo(
    () => getTimeZones().map((z) => ({ label: z.label, value: z.value })),
    []
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Pagination state for table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const fetchTransactions = useCallback(
    async (pageNum: number, pageLimit: number, activeFilters: FilterFields = {}) => {
      setLoading(true);
      try {
        const params = {
          page: pageNum,
          limit: pageLimit,
          ...generateFilterQuery(activeFilters),
        };

        const response = await getProductionTransactions(params);
        handleApiResponse<TransactionListResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setTransactions(data.data);
              setMeta(data.meta);
            } else {
              toast.error('Failed to fetch transactions - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch transactions');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch transactions error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(page, limit, filters);
  }, [fetchTransactions, page, limit, filters]);

  // Fetch filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [usersRes, connectorsRes] = await Promise.all([
          getMerchants({ page: 1, limit: 1000 }),
          getUserConnectors(),
        ]);

        if (usersRes.data && Array.isArray(usersRes.data.data)) {
          const mappedUsers = usersRes.data.data.map((user) => ({
            label: user.name || user.email || user.id,
            value: String(user.id),
          }));
          setUserOptions(mappedUsers);
          setCompanyOptions(
            usersRes.data.data
              .filter((u) => u.name)
              .map((u) => ({
                label: u.name,
                value: u.name,
              }))
          );
        }

        if (connectorsRes.data?.data?.data) {
          setConnectorOptions(
            connectorsRes.data.data.data.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load filter options', error);
      }
    };

    loadOptions();
  }, []);

  // Client-side filtering
  const filteredData = useMemo(
    () => filterTransactions(transactions, searchQuery),
    [transactions, searchQuery]
  );

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1);
  };

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1,
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  // Handlers for action menu
  const handleWebhookLogs = useCallback((transaction: Transaction) => {
    console.log('Webhook logs for transaction:', transaction.transactionId);
  }, []);

  const handleProviderLogs = useCallback((transaction: Transaction) => {
    console.log('Provider logs for transaction:', transaction.transactionId);
  }, []);

  const handleTransactionLogs = useCallback((transaction: Transaction) => {
    console.log('Transaction logs for transaction:', transaction.transactionId);
  }, []);

  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  }, []);

  const handleChargeback = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setChargebackDialogOpen(true);
  }, []);

  const handleRefund = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setRefundDialogOpen(true);
  }, []);

  const handleSuspicious = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setSuspiciousDialogOpen(true);
  }, []);

  const handleApplyFilters = useCallback(
    (appliedFilters: FilterFields) => {
      setFilters(appliedFilters);
      setPage(1);
    },
    []
  );

  const filterSchema: FiltersSchema[] = useMemo(
    () => [
      { field: 'user_id', label: 'Merchant', type: FieldTypes.multiSelect, options: userOptions },
      {
        field: 'company_name',
        label: 'Company',
        type: FieldTypes.multiSelect,
        options: companyOptions,
      },
      { field: 'transaction_id', label: 'Transaction ID', type: FieldTypes.input },
      { field: 'order_id', label: 'Order ID', type: FieldTypes.input },
      { field: 'email', label: 'Email', type: FieldTypes.input },
      { field: 'phone_number', label: 'Phone Number', type: FieldTypes.input },
      { field: 'card_number', label: 'Card Number', type: FieldTypes.input },
      { field: 'card_bin', label: 'Card Bin', type: FieldTypes.input },
      {
        field: 'connector',
        label: 'Connector',
        type: FieldTypes.searchSelect,
        options: connectorOptions,
      },
      {
        field: 'currency',
        label: 'Currency',
        type: FieldTypes.searchSelect,
        options: currencyOptions,
      },
      { field: 'amount_greater_than', label: 'Amount greater than', type: FieldTypes.input },
      { field: 'amount_less_than', label: 'Amount less than', type: FieldTypes.input },
      {
        field: 'status',
        label: 'Status',
        type: FieldTypes.multiSelect,
        options: [
          'Success',
          'Failed',
          'Initialized',
          'Pending',
          'Redirect',
          'Blocked',
          'Abandoned',
        ].map((label) => ({ label, value: label.toLowerCase() })),
      },
      {
        field: 'card_type',
        label: 'Card Type',
        type: FieldTypes.select,
        options: ['VISA', 'MASTER', 'DINNER CLUB', 'JCB'].map((label) => ({
          label,
          value: label,
        })),
      },
      {
        field: 'is_card_wl',
        label: 'Card FT/WTL',
        type: FieldTypes.select,
        options: [
          { label: 'FT', value: 'FT' },
          { label: 'WTL', value: 'WTL' },
        ],
      },
      {
        field: 'country',
        label: 'Country',
        type: FieldTypes.searchSelect,
        options: countryOptions,
      },
      { field: 'created_at', label: 'Created At', type: FieldTypes.dateRange },
      { field: 'transaction_date', label: 'Transaction Date', type: FieldTypes.dateRange },
      { field: 'refund_date', label: 'Refund Date', type: FieldTypes.dateRange },
      { field: 'chargeback_date', label: 'ChargeBack Date', type: FieldTypes.dateRange },
      { field: 'suspicious_date', label: 'Suspicious Date', type: FieldTypes.dateRange },
      { field: 'message', label: 'Message', type: FieldTypes.input },
      {
        field: 'time_zone',
        label: 'Time Zone',
        type: FieldTypes.searchSelect,
        options: timeZoneOptions,
      },
    ],
    [userOptions, companyOptions, connectorOptions, currencyOptions, countryOptions, timeZoneOptions]
  );

  const handleChargebackSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingChargeback(true);
      try {
        const response = await processChargeback(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Chargeback processed successfully');
            setChargebackDialogOpen(false);
            setTransactionForAction(null);
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to process chargeback');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Chargeback error:', error);
      } finally {
        setProcessingChargeback(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const handleRefundSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingRefund(true);
      try {
        const response = await processRefund(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Refund processed successfully');
            setRefundDialogOpen(false);
            setTransactionForAction(null);
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to process refund');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Refund error:', error);
      } finally {
        setProcessingRefund(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const handleSuspiciousSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingSuspicious(true);
      try {
        const response = await markSuspicious(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Transaction marked as suspicious successfully');
            setSuspiciousDialogOpen(false);
            setTransactionForAction(null);
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to mark transaction as suspicious');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Suspicious error:', error);
      } finally {
        setProcessingSuspicious(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () =>
      getTransactionColumns(
        handleWebhookLogs,
        handleProviderLogs,
        handleTransactionLogs,
        handleViewDetails,
        true,
        handleChargeback,
        handleRefund,
        handleSuspicious
      ),
    [
      handleWebhookLogs,
      handleProviderLogs,
      handleTransactionLogs,
      handleViewDetails,
      handleChargeback,
      handleRefund,
      handleSuspicious,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
    pageCount: meta ? meta.totalPages : undefined,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      if (newPagination.pageIndex !== pagination.pageIndex) {
        handlePageChange(newPagination.pageIndex);
      }
      if (newPagination.pageSize !== pagination.pageSize) {
        handlePageSizeChange(newPagination.pageSize);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <Fragment>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems || filteredData.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search transactions..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className={modernTableCardClasses.footer}>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <DynamicTransactionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        transaction={selectedTransaction}
      />

      <DynamicChargebackDialog
        open={chargebackDialogOpen}
        onOpenChange={setChargebackDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleChargebackSubmit}
        isSubmitting={processingChargeback}
      />

      <DynamicRefundDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleRefundSubmit}
        isSubmitting={processingRefund}
      />

      <DynamicSuspiciousDialog
        open={suspiciousDialogOpen}
        onOpenChange={setSuspiciousDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleSuspiciousSubmit}
        isSubmitting={processingSuspicious}
      />

      <Filter
        filtersSchema={filterSchema}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        open={filterOpen}
        setOpen={setFilterOpen}
        baseUrl="/admin/transactions/transactions"
      />
    </Fragment>
  );
}

