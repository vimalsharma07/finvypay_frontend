'use client';

import { useCallback, useEffect, useState } from 'react';
import { Currency, getCurrencies } from '@/lib/services/admin/currency';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

let cachedCurrencies: Currency[] | null = null;
let pendingRequest: Promise<Currency[]> | null = null;

const CURRENCIES_QUERY = {
  page: 1,
  limit: 1000,
  sortBy: 'code',
  sortOrder: 'ASC' as const,
};

const normalizeCurrencies = (payload: any): Currency[] => {
  if (!payload) return [];

  if (Array.isArray(payload.data)) {
    return payload.data as Currency[];
  }

  if (payload.data?.data && Array.isArray(payload.data.data)) {
    return payload.data.data as Currency[];
  }

  if (Array.isArray(payload)) {
    return payload as Currency[];
  }

  return [];
};

const fetchCurrencies = async (): Promise<Currency[]> => {
  const response = await getCurrencies(CURRENCIES_QUERY);

  return new Promise<Currency[]>((resolve, reject) => {
    const handled = handleApiResponse(response, {
      silent: true,
      onSuccess: (data) => resolve(normalizeCurrencies(data)),
      onError: (errorMessage) =>
        reject(new Error(errorMessage || 'Failed to load currencies')),
    });

    if (!handled) {
      reject(new Error(response.error || 'Failed to load currencies'));
    }
  });
};

const loadCurrencies = async (force = false): Promise<Currency[]> => {
  if (!force && cachedCurrencies) {
    return cachedCurrencies;
  }

  if (!force && pendingRequest) {
    return pendingRequest;
  }

  if (force) {
    cachedCurrencies = null;
    pendingRequest = null;
  }

  pendingRequest = fetchCurrencies()
    .then((currencies) => {
      cachedCurrencies = currencies;
      return currencies;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(cachedCurrencies ?? []);
  const [loading, setLoading] = useState(!cachedCurrencies);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const data = await loadCurrencies(force);
      setCurrencies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load currencies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedCurrencies) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [refresh]);

  return {
    currencies,
    loading,
    error,
    refresh: () => refresh(true),
  };
};
