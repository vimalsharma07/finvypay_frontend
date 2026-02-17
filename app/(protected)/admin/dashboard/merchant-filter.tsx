'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMerchants, type Merchant } from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Loader2 } from 'lucide-react';

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
        console.log('Merchants API Response:', response);
        handleApiResponse(response, {
          onSuccess: (res) => {
            console.log('Merchants Success Response:', res);
            // res is MerchantListResponse: { success: boolean, data: Merchant[], meta: {...} }
            if (res?.success && Array.isArray(res.data)) {
              // Filter merchants client-side by role
              const merchantUsers = res.data.filter((user: Merchant) => 
                user.role?.toLowerCase() === 'merchant' || user.role === 'MERCHANT'
              );
              console.log('Filtered Merchants:', merchantUsers);
              setMerchants(merchantUsers);
            } else {
              console.warn('Unexpected response structure:', res);
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

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select merchant...">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : value === 'all' ? (
            'All Merchants'
          ) : (
            merchants.find(m => String(m.id) === value)?.email || 'Select merchant...'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Merchants</SelectItem>
        {merchants.length === 0 && !loading ? (
          <SelectItem value="no-merchants" disabled>
            No merchants found
          </SelectItem>
        ) : (
          merchants.map((merchant) => (
            <SelectItem key={merchant.id} value={String(merchant.id)}>
              {merchant.email}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
