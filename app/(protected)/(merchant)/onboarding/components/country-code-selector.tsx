'use client';

import { useEffect, useState, useMemo } from 'react';
import { SearchSelect } from '@/components/ui/molecules/SearchSelect';
import { getCountries, Country } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import type { Option } from '@/lib/types/common-types';

function getFlagEmoji(country: Country): string {
  if (country.flag) return country.flag;
  const code = country.isoTwo;
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

interface CountryCodeSelectorProps {
  value?: number;
  onChange: (countryCodeId: number) => void;
  disabled?: boolean;
  showPhoneCode?: boolean; // If false, only show country name
}

export function CountryCodeSelector({
  value,
  onChange,
  disabled = false,
  showPhoneCode = true, // Default to showing phone code for backward compatibility
}: CountryCodeSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await getCountries({
          page: 1,
          limit: 1000,
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

  // Convert countries to SearchSelect options format with flag emoji
  // Format: "(+93) Afghanistan 🇦🇫" - (code) country name flag
  const countryOptions: Option[] = useMemo(() => {
    return countries.map((country) => {
      const flag = getFlagEmoji(country);
      const phoneCode = country.phoneCode ? `+${country.phoneCode.replace(/^\+/, '')}` : '';
      const text = showPhoneCode
        ? `(${phoneCode}) ${country.countryName} ${flag}`.trim()
        : `${country.countryName} ${flag}`.trim();
      return {
        value: country.id,
        label: text,
      };
    });
  }, [countries, showPhoneCode]);

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

