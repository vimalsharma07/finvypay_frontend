'use client';

import { useEffect, useState, useMemo } from 'react';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { getCountries, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import type { Option } from '@/lib/types/common-types';

interface CountryCodeSelectorProps {
  value?: number;
  onChange: (countryCodeId: number) => void;
  disabled?: boolean;
}

export function CountryCodeSelector({
  value,
  onChange,
  disabled = false,
}: CountryCodeSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await getCountries({
          page: 1,
          limit: 100,
          sortBy: 'countryName',
          sortOrder: 'ASC',
        });

        handleApiResponse(response, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...] }
            if (data && data.success && data.data) {
              setCountries(Array.isArray(data.data) ? data.data : []);
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch countries:', errorMessage);
          },
        });
      } catch (error) {
        console.error('Countries fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Convert countries to SearchSelect options format
  // Format: "PhoneCode (CountryName)" for better searchability
  // Users can search by phone code (e.g., "+1") or country name (e.g., "United States")
  const countryOptions: Option[] = useMemo(() => {
    return countries.map((country) => ({
      value: country.id,
      label: `${country.phoneCode} (${country.countryName})`,
    }));
  }, [countries]);

  const handleChange = (selectedValue: string) => {
    onChange(Number(selectedValue));
  };

  return (
    <SearchSelect
      options={countryOptions}
      value={value ? String(value) : ''}
      onChange={handleChange}
      valueToShow="label"
      valueToSet="value"
      placeholder={loading ? 'Loading countries...' : 'Select country code'}
      disabled={disabled || loading}
    />
  );
}

