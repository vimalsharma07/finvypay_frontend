'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getProductionTransactions,
  processChargeback,
  processRefund,
  markSuspicious,
  resendTransactionWebhook,
  Transaction,
  TransactionListResponse,
  TRANSACTION_STATUS_FILTER_OPTIONS,
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
import { TransactionLogsDialog } from '../shared/transaction-logs-dialog';
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
import { generateFilterQuery, mapAdminTransactionFiltersToApiParams } from '@/lib/helpers';
import { getAllMerchantsPaginated } from '@/lib/services/admin/users';
import { getUserConnectors } from '@/lib/services/admin/connectors';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useCountries } from '@/lib/hooks/use-countries';
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
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [transactionForAction, setTransactionForAction] = useState<Transaction | null>(null);
  const [processingChargeback, setProcessingChargeback] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingSuspicious, setProcessingSuspicious] = useState(false);
  const [resendingWebhookTransactionId, setResendingWebhookTransactionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterFields>({});
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);
  
  // Use external filter state if provided, otherwise use internal
  const filterOpen = externalFilterOpen !== undefined ? externalFilterOpen : internalFilterOpen;
  const setFilterOpen = externalSetFilterOpen || setInternalFilterOpen;

  // Dropdown options
  const [userOptions, setUserOptions] = useState<Option[]>([]);
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
        const filterQuery = generateFilterQuery(activeFilters);
        const apiParams = mapAdminTransactionFiltersToApiParams(filterQuery);
        const params = {
          page: pageNum,
          limit: pageLimit,
          ...apiParams,
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
        const [merchants, connectorsRes] = await Promise.all([
          getAllMerchantsPaginated(),
          getUserConnectors(),
        ]);

        if (Array.isArray(merchants)) {
          setUserOptions(
            merchants.map((user) => ({
              label: user.name || user.email || user.id,
              value: String(user.id),
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

  const handleViewLogs = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setLogsDialogOpen(true);
  }, []);

  const handleViewLogsFromDetails = useCallback(
    (transaction: Transaction) => {
      handleViewLogs(transaction);
      setDetailsDialogOpen(false);
    },
    [handleViewLogs]
  );

  const handleResendWebhook = useCallback(async (transaction: Transaction) => {
    const tid = transaction.transactionId?.trim();
    if (!tid) {
      toast.error('Missing transaction ID');
      return;
    }
    setResendingWebhookTransactionId(tid);
    try {
      const response = await resendTransactionWebhook(tid);
      handleApiResponse(response, {
        onSuccess: (data) => {
          const msg =
            data &&
            typeof data === 'object' &&
            'message' in data &&
            data.message != null &&
            String(data.message).trim()
              ? String(data.message)
              : 'Webhook resent successfully';
          toast.success(msg);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to resend webhook');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Resend webhook error:', error);
    } finally {
      setResendingWebhookTransactionId(null);
    }
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
      {
        field: 'user_id',
        label: 'Merchant',
        type: FieldTypes.multiSelect,
        options: userOptions,
        multiSelectSize: 'comfortable',
      },
      { field: 'transaction_id', label: 'Transaction ID', type: FieldTypes.input },
      { field: 'order_id', label: 'Order ID', type: FieldTypes.input },
      { field: 'email', label: 'Email', type: FieldTypes.input },
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
      {
        field: 'status',
        label: 'Status',
        type: FieldTypes.multiSelect,
        options: TRANSACTION_STATUS_FILTER_OPTIONS.map((o) => ({
          label: o.label,
          value: String(o.value),
        })),
      },
      {
        field: 'country',
        label: 'Country',
        type: FieldTypes.searchSelect,
        options: countryOptions,
      },
      { field: 'transaction_date', label: 'Transaction Date', type: FieldTypes.date },
      { field: 'refund_date', label: 'Refund Date', type: FieldTypes.date },
      { field: 'chargeback_date', label: 'ChargeBack Date', type: FieldTypes.date },
      { field: 'message', label: 'Message', type: FieldTypes.input },
    ],
    [userOptions, connectorOptions, currencyOptions, countryOptions]
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
        handleViewDetails,
        true,
        handleChargeback,
        handleRefund,
        handleSuspicious,
        handleViewLogs,
        handleResendWebhook,
        resendingWebhookTransactionId
      ),
    [
      handleViewDetails,
      handleChargeback,
      handleRefund,
      handleSuspicious,
      handleViewLogs,
      handleResendWebhook,
      resendingWebhookTransactionId,
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
        onResendWebhook={handleResendWebhook}
        isResendingWebhook={
          !!selectedTransaction?.transactionId &&
          resendingWebhookTransactionId === selectedTransaction.transactionId
        }
        onViewLogs={handleViewLogsFromDetails}
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

      <TransactionLogsDialog
        open={logsDialogOpen}
        onOpenChange={setLogsDialogOpen}
        transaction={transactionForAction}
        paymentMode="production"
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

