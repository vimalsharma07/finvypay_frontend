/**
 * Fetch Options Utilities
 * Functions to fetch dropdown options for forms
 */

import { http } from '../api';
import { adminRoutes } from '../routes/routes';
import { getGateways } from '../services/admin/gateways';
import { getPaymentChannels } from '../services/admin/payment-channels';
import { getCurrencies } from '../services/admin/currency';
import { handleApiResponse } from '../utils/api-response-handler';
import type { Option } from '../types/common-types';

/**
 * Fetch provider (gateway) options
 * Note: token parameter is kept for compatibility but not used since http handles auth automatically
 */
export async function fetchAdminProviderOptions(token?: string): Promise<Option[]> {
  try {
    const response = await getGateways({ page: 1, limit: 1000 });
    let providers: Option[] = [];

    handleApiResponse(response, {
      onSuccess: (data) => {
        if (data && data.success && data.data) {
          providers = data.data.data.map((gateway: any) => ({
            value: gateway.id.toString(),
            label: gateway.gatewayName,
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
 * Fetch connector (payment channel) options filtered by provider and payment method
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

    const response = await getPaymentChannels({
      page: 1,
      limit: 1000,
    });

    let connectors: Option[] = [];

    handleApiResponse(response, {
      onSuccess: (data) => {
        if (data && data.success && data.data) {
          // Filter by gatewayId and providerType
          const filtered = data.data.data.filter((channel: any) => {
            const matchesGateway = channel.gatewayId === Number(providerId) || 
                                  String(channel.gatewayId) === providerId;
            const matchesProviderType = channel.providerType === providerType;
            const notDeleted = !channel.isDeleted;
            return matchesGateway && matchesProviderType && notDeleted;
          });

          connectors = filtered.map((channel: any) => ({
            value: channel.id.toString(),
            label: channel.name,
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
        if (data && data.success && data.data) {
          currencies = data.data.data.map((currency: any) => ({
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

