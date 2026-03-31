'use client';

import { ApiError, http } from '../../api';
import type { ApiResponse } from '../types';
import { getS3FileUrl } from '@/lib/s3-url';

export interface PaymentTemplate {
  id: string;
  merchantId: string;
  name: string;
  primaryColor: string;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

const getBaseUrl = () => '/merchant/payment-template';

export async function getUserPaymentTemplates(): Promise<
  ApiResponse<{ success: boolean; data: PaymentTemplate[] }>
> {
  try {
    const data = await http.get(getBaseUrl()) as {
      success: boolean;
      data: PaymentTemplate[];
    };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export async function createUserPaymentTemplate(payload: {
  name: string;
  primaryColor: string;
  logoUrl?: string;
}): Promise<ApiResponse<{ success: boolean; data: PaymentTemplate }>> {
  try {
    const data = await http.post(getBaseUrl(), payload) as {
      success: boolean;
      data: PaymentTemplate;
    };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export async function updateUserPaymentTemplate(
  templateId: string,
  payload: {
    name?: string;
    primaryColor?: string;
    isActive?: boolean;
    logoUrl?: string;
  },
): Promise<ApiResponse<{ success: boolean; data: PaymentTemplate }>> {
  try {
    const data = await http.put(`${getBaseUrl()}/${templateId}`, payload) as {
      success: boolean;
      data: PaymentTemplate;
    };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export async function uploadTemplateLogo(file: File): Promise<ApiResponse<{ success: boolean; data: { url: string } }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'Payment template logo');
    formData.append('type', 'common');

    const raw = await http.post('/file-upload', formData, { json: false }) as any;

    const extractLogoUrl = (input: any): string => {
      if (!input) return '';
      if (typeof input === 'string') {
        if (
          input.startsWith('http://') ||
          input.startsWith('https://') ||
          input.startsWith('/')
        ) {
          return input;
        }
        return '';
      }
      if (typeof input !== 'object') return '';

      const preferredKeys = [
        'url',
        'fileUrl',
        'location',
        'path',
        'secure_url',
        'publicId',
        'key',
      ];
      for (const key of preferredKeys) {
        const value = input[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          const trimmed = value.trim();
          if (
            trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/')
          ) {
            return trimmed;
          }
          return getS3FileUrl(trimmed);
        }
      }

      for (const value of Object.values(input)) {
        const nested = extractLogoUrl(value);
        if (nested) return nested;
      }

      return '';
    };

    const resolvedUrl = extractLogoUrl(raw);

    if (!resolvedUrl) {
      return {
        status: 400,
        error: 'Upload succeeded but logo URL was not returned',
        data: raw,
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        data: { url: resolvedUrl },
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}

export async function deleteUserPaymentTemplate(
  templateId: string,
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const data = await http.delete(`${getBaseUrl()}/${templateId}`) as {
      success: boolean;
      message: string;
    };
    return { status: 200, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { status: error.status, error: error.message, data: error.data };
    }
    throw error;
  }
}
