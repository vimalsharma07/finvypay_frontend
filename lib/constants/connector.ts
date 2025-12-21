/**
 * Connector Constants
 */

export const CONNECTOR_TYPES = {
  CARD: 'Card',
  CRYPTO: 'Crypto',
  APM: 'APM',
} as const;

export const CONNECTOR_RATES_TYPE = {
  NORMAL: 'NORMAL',
  TIERED: 'TIERED',
} as const;

export const CRYPTO_FLOW = {
  1: 'Crypto Payin',
  2: 'On Ramp',
  3: 'Off Ramp',
  4: 'Swap',
} as const;

