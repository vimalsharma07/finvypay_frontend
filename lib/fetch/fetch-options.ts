/**
 * Fetch Options Utilities
 * Functions to fetch dropdown options for forms
 */

import { http } from '../api';
import { adminRoutes } from '../routes/routes';
import { getAcquirers } from '../services/admin/acquirers';
import { getAcquirerAccounts } from '../services/admin/acquirer-accounts';
import { getCurrencies } from '../services/admin/currency';
import { handleApiResponse } from '../utils/api-response-handler';
import type { Option } from '../types/common-types';

/**
 * Fetch provider (acquirer) options
 * Note: token parameter is kept for compatibility but not used since http handles auth automatically
 */
export async function fetchAdminProviderOptions(token?: string): Promise<Option[]> {
  try {
    const response = await getAcquirers({ page: 1, limit: 100 });
    let providers: Option[] = [];

    handleApiResponse(response, {
      onSuccess: (data) => {
        // New format: { success: true, data: [...] }
        if (data && data.success && data.data) {
          providers = (Array.isArray(data.data) ? data.data : []).map((acquirer: any) => ({
            value: acquirer.id.toString(),
            label: acquirer.acquirerName,
          }));
        }
      },
      onError: (errorMessage) => {
        console.error('Error fetching provider options:', errorMessage);
      },
    });

    return providers;
  } catch (error) {
    console.error('Error fetching provider options:', error);
    return [];
  }
}

/**
 * Fetch connector (acquirer account) options filtered by provider and payment method
 * Note: token parameter is kept for compatibility but not used since http handles auth automatically
 */
export async function fetchAdminProviderConnectorsOptions(
  token: string,
  providerId: string,
  paymentMethod: string = 'CARD'
): Promise<Option[]> {
  try {
    // Map payment method to provider type
    const providerTypeMap: Record<string, string> = {
      CARD: 'CARD',
      CRYPTO: 'CRYPTO',
      APM: 'APM',
    };

    const providerType = providerTypeMap[paymentMethod] || 'CARD';

    const response = await getAcquirerAccounts({
      page: 1,
      limit: 100,
      acquirerId: Number(providerId),
    });

    let connectors: Option[] = [];

    handleApiResponse(response, {
      onSuccess: (data) => {
        // New format: { success: true, data: [...] }
        if (data && data.success && data.data) {
          // Filter by acquirerId and providerType
          const filtered = (Array.isArray(data.data) ? data.data : []).filter((account: any) => {
            const matchesAcquirer = account.acquirerId === Number(providerId) || 
                                  String(account.acquirerId) === providerId;
            const matchesProviderType = account.providerType === providerType;
            const notDeleted = !account.isDeleted;
            return matchesAcquirer && matchesProviderType && notDeleted;
          });

          connectors = filtered.map((account: any) => ({
            value: account.id.toString(),
            label: account.name,
          }));
        }
      },
    });

    return connectors;
  } catch (error) {
    console.error('Error fetching connector options:', error);
    return [];
  }
}

/**
 * Fetch currency options
 * Note: token parameter is kept for compatibility but not used since http handles auth automatically
 */
export async function fetchListOfCurrencies(token?: string): Promise<Option[]> {
  try {
    const response = await getCurrencies({ page: 1, limit: 1000 });
    let currencies: Option[] = [];

    handleApiResponse(response, {
      onSuccess: (data) => {
        // New format: { success: true, data: [...] }
        if (data && data.success && data.data) {
          currencies = (Array.isArray(data.data) ? data.data : []).map((currency: any) => ({
            value: currency.code || currency.value,
            label: currency.code || currency.value,
          }));
        }
      },
    });

    return currencies;
  } catch (error) {
    console.error('Error fetching currency options:', error);
    return [];
  }
}

