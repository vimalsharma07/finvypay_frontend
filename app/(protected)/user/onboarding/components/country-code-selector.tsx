'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCountries, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

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

  const selectedCountry = countries.find(
    (country) => country.id === String(value)
  );

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(val) => onChange(Number(val))}
      disabled={disabled || loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading...' : 'Select country code'}>
          {selectedCountry && (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.phoneCode}</span>
              <span className="text-muted-foreground">({selectedCountry.countryName})</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.id} value={country.id}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{country.phoneCode}</span>
              <span className="text-muted-foreground">{country.countryName}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

