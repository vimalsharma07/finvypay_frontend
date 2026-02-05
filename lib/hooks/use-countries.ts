'use client';

import { useCallback, useEffect, useState } from 'react';
import { Country, getCountries } from '@/lib/services/admin/countries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

let cachedCountries: Country[] | null = null;
let pendingRequest: Promise<Country[]> | null = null;

const COUNTRIES_QUERY = {
  page: 1,
  limit: 1000,
  sortBy: 'countryName',
  sortOrder: 'ASC' as const,
};

const normalizeCountries = (payload: any): Country[] => {
  if (!payload) return [];

  // Standard format: { success: true, data: Country[] }
  if (Array.isArray(payload.data)) {
    return payload.data as Country[];
  }

  // Legacy format: { data: { data: Country[] } }
  if (payload.data?.data && Array.isArray(payload.data.data)) {
    return payload.data.data as Country[];
  }

  // Direct array
  if (Array.isArray(payload)) {
    return payload as Country[];
  }

  return [];
};

const fetchCountries = async (): Promise<Country[]> => {
  const response = await getCountries(COUNTRIES_QUERY);

  return new Promise<Country[]>((resolve, reject) => {
    const handled = handleApiResponse(response, {
      silent: true,
      onSuccess: (data) => resolve(normalizeCountries(data)),
      onError: (errorMessage) =>
        reject(new Error(errorMessage || 'Failed to load countries')),
    });

    if (!handled) {
      reject(new Error(response.error || 'Failed to load countries'));
    }
  });
};

const loadCountries = async (force = false): Promise<Country[]> => {
  if (!force && cachedCountries) {
    return cachedCountries;
  }

  if (!force && pendingRequest) {
    return pendingRequest;
  }

  if (force) {
    cachedCountries = null;
    pendingRequest = null;
  }

  pendingRequest = fetchCountries()
    .then((countries) => {
      cachedCountries = countries;
      return countries;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>(cachedCountries ?? []);
  const [loading, setLoading] = useState(!cachedCountries);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const data = await loadCountries(force);
      setCountries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedCountries) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [refresh]);

  return {
    countries,
    loading,
    error,
    refresh: () => refresh(true),
  };
};
