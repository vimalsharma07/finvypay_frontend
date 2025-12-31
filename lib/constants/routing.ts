export const ROUTE_CONDITION_CATEGORY_MAP = {
  AMOUNT: 'amount',
  CURRENCY: 'currency',
  COUNTRY: 'country',
  BIN_COUNTRY: 'bin_country',
  BIN_NUMBER: 'bin_number',
  CARD_TYPE: 'card_type',
  CARD_WL_FT: 'card_wl_ft',
} as const;

export const ROUTE_CONDITION_OPERATOR_MAP = {
  EQUALS: '==',
  IN: 'in',
  NOT_IN: 'not_in',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_THAN_OR_EQUALS: '>=',
  LESS_THAN_OR_EQUALS: '<=',
} as const;

export const ROUTE_CONDITION_CATEGORIES = [
  { label: 'Amount', value: ROUTE_CONDITION_CATEGORY_MAP.AMOUNT },
  { label: 'Currency', value: ROUTE_CONDITION_CATEGORY_MAP.CURRENCY },
  { label: 'Country', value: ROUTE_CONDITION_CATEGORY_MAP.COUNTRY },
  { label: 'Bin Country', value: ROUTE_CONDITION_CATEGORY_MAP.BIN_COUNTRY },
  { label: 'Bin Number', value: ROUTE_CONDITION_CATEGORY_MAP.BIN_NUMBER },
  { label: 'Card Type', value: ROUTE_CONDITION_CATEGORY_MAP.CARD_TYPE },
  { label: 'Card WL/FT', value: ROUTE_CONDITION_CATEGORY_MAP.CARD_WL_FT },
];

export const CONDITION_OPERATOR_MAP: Record<
  string,
  { label: string; value: string; inputType: 'input' | 'search-select' | 'multi-select' | 'multi-input' | 'select' }[]
> = {
  amount: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'input' },
    { label: '>', value: ROUTE_CONDITION_OPERATOR_MAP.GREATER_THAN, inputType: 'input' },
    { label: '<', value: ROUTE_CONDITION_OPERATOR_MAP.LESS_THAN, inputType: 'input' },
    { label: '>=', value: ROUTE_CONDITION_OPERATOR_MAP.GREATER_THAN_OR_EQUALS, inputType: 'input' },
    { label: '<=', value: ROUTE_CONDITION_OPERATOR_MAP.LESS_THAN_OR_EQUALS, inputType: 'input' },
  ],
  currency: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'search-select' },
    { label: 'In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.IN, inputType: 'multi-select' },
    { label: 'Not In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.NOT_IN, inputType: 'multi-select' },
  ],
  country: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'search-select' },
    { label: 'In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.IN, inputType: 'multi-select' },
    { label: 'Not In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.NOT_IN, inputType: 'multi-select' },
  ],
  bin_country: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'search-select' },
    { label: 'In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.IN, inputType: 'multi-select' },
    { label: 'Not In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.NOT_IN, inputType: 'multi-select' },
  ],
  bin_number: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'input' },
    { label: 'In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.IN, inputType: 'multi-input' },
    { label: 'Not In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.NOT_IN, inputType: 'multi-input' },
  ],
  card_type: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'select' },
    { label: 'In (...)', value: ROUTE_CONDITION_OPERATOR_MAP.IN, inputType: 'multi-select' },
  ],
  card_wl_ft: [
    { label: '=', value: ROUTE_CONDITION_OPERATOR_MAP.EQUALS, inputType: 'select' },
  ],
};

export const CARD_TYPE_OPTIONS = [
  { label: 'VISA', value: '1' },
  { label: 'MASTERCARD', value: '2' },
];

export const CARD_WL_FT_OPTIONS = [
  { label: 'White Listed', value: 'WL' },
  { label: 'First Time', value: 'FT' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Card', value: 'CARD' },
  // { label: 'UPI', value: 'UPI' },
  { label: 'Crypto', value: 'CRYPTO' },
  { label: 'APM', value: 'APM' },
];

export const CRYPTO_PAYMENT_TYPES = [
  { label: 'Exchange', value: 'Exchange' },
  { label: 'Payin', value: 'Payin' },
];

export const CRYPTO_TRANSACTION_TYPES = [
  { label: 'ONRAMP', value: 'ONRAMP' },
  { label: 'OFFRAMP', value: 'OFFRAMP' },
];

export const PAYMENT_METHODS = {
  1: 'Card',
  2: 'UPI',
  3: 'Crypto',
  4: 'APM',
} as const;

export const CONNECTOR_TYPES = {
  CARD: 'Card',
  // UPI: 'UPI',
  CRYPTO: 'Crypto',
  APM: 'APM',
} as const;

