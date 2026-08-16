/**
 * Admin SMTP API Service
 */

import { http, ApiError } from '../../api';
import { adminRoutes } from '../../routes/routes';
import type { ApiResponse } from '../types';

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  fromName: string;
  logoUrl?: string;
}

export interface SmtpConfigResponse {
  success: boolean;
  data: SmtpConfig;
  message?: string;
}

export interface SmtpTestSendPayload {
  to: string;
}

export interface SmtpTestLog {
  level: 'info' | 'success' | 'error';
  message: string;
}

export interface SmtpTestSendResult {
  success: boolean;
  message: string;
  logs: SmtpTestLog[];
  messageId?: string;
}

function asSmtpConfig(raw: unknown): SmtpConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const payload =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : data;

  const host = String(payload.host ?? '').trim();
  const port = Number(payload.port);
  const username = String(payload.username ?? '').trim();
  const password = String(payload.password ?? '');
  const from = String(payload.from ?? '').trim();

  if (!host || !port || !username || !from) return null;

  return {
    host,
    port,
    username,
    password,
    from,
    fromName: String(payload.fromName ?? '').trim(),
    logoUrl: String(payload.logoUrl ?? '').trim(),
  };
}

/**
 * Fetch SMTP credentials from backend (GET /smtp-config).
 */
export async function getSmtpConfig(): Promise<ApiResponse<SmtpConfigResponse>> {
  try {
    const raw = await http.get(adminRoutes.smtp.config);

    const config = asSmtpConfig(raw);
    if (!config) {
      return {
        status: 500,
        error: 'SMTP config response is missing required fields',
      };
    }

    return {
      status: 200,
      data: { success: true, data: config },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Failed to load SMTP config',
    };
  }
}

export async function sendSmtpTestEmail(
  payload: SmtpTestSendPayload
): Promise<ApiResponse<SmtpTestSendResult>> {
  try {
    const data = (await http.post('/api/admin/smtp/send-test', payload, {
      timeoutMs: 45_000,
    })) as SmtpTestSendResult;

    return {
      status: 200,
      data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const fallbackLogs: SmtpTestLog[] = [
        { level: 'error', message: error.message },
      ];
      const nestedLogs = error.data?.logs;
      return {
        status: error.status,
        error: error.message,
        data: {
          success: false,
          message: error.message,
          logs: Array.isArray(nestedLogs) ? nestedLogs : fallbackLogs,
        },
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Failed to send test email',
    };
  }
}
