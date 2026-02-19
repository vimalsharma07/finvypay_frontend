'use client';

import { useState, useEffect, useMemo } from 'react';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { getMerchants, type Merchant } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Loader2 } from 'lucide-react';
import type { Option } from '@/lib/types/common-types';

interface MerchantFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function MerchantFilter({ value, onChange }: MerchantFilterProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      try {
        // Try without role filter first to see all users, then we can filter client-side if needed
        const response = await getMerchants({ page: 1, limit: 1000 });
        handleApiResponse(response, {
          onSuccess: (res) => {
            // res is MerchantListResponse: { success: boolean, data: Merchant[], meta: {...} }
            if (res?.success && Array.isArray(res.data)) {
              // Filter merchants client-side by role
              const merchantUsers = res.data.filter((user: Merchant) => 
                user.role?.toLowerCase() === 'merchant' || user.role === 'MERCHANT'
              );
              setMerchants(merchantUsers);
            } else {
              // Try direct array access as fallback
              if (Array.isArray(res)) {
                const merchantUsers = res.filter((user: Merchant) => 
                  user.role?.toLowerCase() === 'merchant' || user.role === 'MERCHANT'
                );
                setMerchants(merchantUsers);
              }
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch merchants:', errorMessage);
          },
        });
      } catch (error) {
        console.error('Merchants fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  // Convert merchants to options format for SearchSelect
  // Display format: "Merchant Name (email@example.com)"
  const options = useMemo<Option[]>(() => {
    const merchantOptions: Option[] = [
      { label: 'All Merchants', value: 'all' }
    ];
    
    merchants.forEach((merchant) => {
      const displayLabel = merchant.name 
        ? `${merchant.name} (${merchant.email})`
        : merchant.email;
      merchantOptions.push({
        label: displayLabel,
        value: String(merchant.id),
      });
    });
    
    return merchantOptions;
  }, [merchants]);

  if (loading) {
    return (
      <div className="w-[350px] flex items-center justify-center gap-2 px-3 py-2 border border-input rounded-md bg-background">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading merchants...</span>
      </div>
    );
  }

  return (
    <div className="w-[350px]">
      <SearchSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select merchant..."
        disabled={loading}
        maxHeight="300px"
      />
    </div>
  );
}
