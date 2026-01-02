'use client';

import { Fragment, useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { getCountries, CountryListResponse, Country, deleteCountry } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmComp } from '../../../components/confirm-comp';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CountriesPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CountryListResponse['data']['meta'] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('countryName');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);

  // Fetch countries function
  const fetchCountries = async (
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

      const response = await getCountries(params);

      // Handle response using centralized handler
      handleApiResponse<CountryListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setCountries(data.data);
            setMeta(data.meta);
            console.log('Countries list:', data.data);
            console.log('Meta info:', data.meta);
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
    fetchCountries(page, limit, sortBy, sortOrder);
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

  // Handle create country
  const handleCreateCountry = () => {
    router.push('/admin/master/countries/create');
  };

  // Delete country handler
  const handleDeleteCountry = async (countryId: string) => {
    try {
      const response = await deleteCountry(countryId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Country deleted successfully!');
          // Immediately refetch countries list to update the table
          fetchCountries(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete country');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete country error:', error);
    }
  };

  // Define table headers
  const headers: TableHeader<Country>[] = [
    { key: 'flag', label: 'Flag', sortable: false },
    { key: 'countryName', label: 'Country Name', sortable: true },
    { key: 'local', label: 'Local Name', sortable: true },
    { key: 'isoTwo', label: 'ISO 2', sortable: true },
    { key: 'isoThree', label: 'ISO 3', sortable: true },
    { key: 'phoneCode', label: 'Phone Code', sortable: true },
    { key: 'continent', label: 'Continent', sortable: true },
    { key: 'currencyCode', label: 'Currency', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: Country, key: keyof Country | string) => {
    switch (key) {
      case 'flag':
        return (
          <div className="text-2xl" title={item.countryName}>
            {item.flag}
          </div>
        );
      case 'countryName':
        return (
          <div className="font-medium">
            {item.countryName}
          </div>
        );
      case 'local':
        return (
          <div className="text-muted-foreground">
            {item.local}
          </div>
        );
      case 'isoTwo':
        return (
          <Badge variant="secondary" className="font-mono">
            {item.isoTwo}
          </Badge>
        );
      case 'isoThree':
        return (
          <Badge variant="secondary" className="font-mono">
            {item.isoThree}
          </Badge>
        );
      case 'phoneCode':
        return (
          <div className="text-foreground font-normal">
            +{item.phoneCode}
          </div>
        );
      case 'continent':
        return (
          <Badge variant="outline" className="capitalize">
            {item.continent}
          </Badge>
        );
      case 'currencyCode':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {item.currencyCode}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {item.currencySymbol}
            </span>
          </div>
        );
      case 'status':
        return (
          <Badge
            variant={item.status === 'active' ? 'success' : 'destructive'}
            className="capitalize"
          >
            {item.status}
          </Badge>
        );
      case 'createdAt':
        const createdDate = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {createdDate.toLocaleDateString()} {createdDate.toLocaleTimeString()}
          </div>
        );
      default:
        const value = item[key as keyof Country];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<Country>[] = [
    {
      label: 'View',
      route: (row: Country) => `/admin/master/countries/${row.id}`,
    },
    {
      label: 'Edit',
      route: (row: Country) => `/admin/master/countries/${row.id}/edit`,
    },
    {
      label: 'Delete',
      onClick: (row: Country) => {
        setCountryToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Countries"
              description="Manage and view all countries with their details, currency codes, and status for merchant onboarding and transaction processing"
              icon={Globe}
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
              title="Countries"
              description="Manage and view all countries with their details, currency codes, and status for merchant onboarding and transaction processing"
              icon={Globe}
            />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateCountry}>
              Create Country
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={countries}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search countries..."
          searchKeys={['countryName', 'local', 'isoTwo', 'isoThree', 'continent', 'currencyCode']}
          getRowId={(row: Country) => row.id}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Country"
        message={`Are you sure you want to delete country "${countryToDelete?.countryName}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (countryToDelete) {
            await handleDeleteCountry(countryToDelete.id);
            setCountryToDelete(null);
          }
        }}
        onCancel={() => {
          setCountryToDelete(null);
        }}
      />
    </Fragment>
  );
}
