/**
 * Admin - SMTP Routes
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminSmtpRoutes = {
  config: `${BASE_URL}/smtp-config`,
} as const;
