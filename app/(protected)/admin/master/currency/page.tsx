'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { getCurrencies, CurrencyListResponse, Currency } from '@/lib/services/admin/currency';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CurrencyListResponse['data']['meta'] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('code');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Fetch currencies function
  const fetchCurrencies = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC'
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };

      const response = await getCurrencies(params);

      // Handle response using centralized handler
      handleApiResponse<CurrencyListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            setCurrencies(data.data.data);
            setMeta(data.data.meta);
            console.log('Currencies list:', data.data.data);
            console.log('Meta info:', data.data.meta);
          } else {
            console.warn('⚠️ API returned success=false:', data);
          }
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
        },
        onUnauthorized: () => {
          console.log('Please check your TOKEN in .env file');
        },
      });
    } catch (error) {
      console.error('❌ Network/Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when pagination, sorting, or limit change
  useEffect(() => {
    fetchCurrencies(page, limit, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder]);

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1); // API uses 1-based, table uses 0-based
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sorting changes
  };

  // Define table headers
  const headers: TableHeader<Currency>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'isDeleted', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true },
    { key: 'updatedAt', label: 'Updated At', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: Currency, key: keyof Currency | string) => {
    switch (key) {
      case 'code':
        return (
          <div className="font-medium">
            <Badge variant="secondary" className="font-mono">
              {item.code}
            </Badge>
          </div>
        );
      case 'value':
        return (
          <div className="text-foreground font-normal">
            {parseFloat(item.value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 10,
            })}
          </div>
        );
      case 'isDeleted':
        return (
          <Badge
            variant={item.isDeleted ? 'destructive' : 'success'}
            className="capitalize"
          >
            {item.isDeleted ? 'Deleted' : 'Active'}
          </Badge>
        );
      case 'createdAt':
        const createdDate = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
          </div>
        );
      case 'updatedAt':
        const updatedDate = new Date(item.updatedAt);
        return (
          <div className="text-sm text-muted-foreground">
            {updatedDate.toLocaleDateString()} {updatedDate.toLocaleTimeString()}
          </div>
        );
      default:
        const value = item[key as keyof Currency];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Currency"
              description="View all currency codes and their values"
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Currency"
            description="View all currency codes and their values"
          />
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={currencies}
          headers={headers}
          renderCell={renderCell}
          enableCheckbox={false}
          searchPlaceholder="Search currencies..."
          searchKeys={['code', 'value']}
          getRowId={(row: Currency) => row.id}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1, // Convert to 0-based for table
            totalCount: meta?.totalItems ?? 0,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          sorting={{
            sortBy: sortBy,
            sortOrder: sortOrder,
            onSortChange: handleSortChange,
          }}
          loading={loading}
        />
      </Container>
    </Fragment>
  );
}
