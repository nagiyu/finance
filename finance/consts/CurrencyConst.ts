/**
 * Currency constants for the finance module
 */
export const CURRENCY = {
  JPY: 'JPY',
  USD: 'USD',
} as const;

/**
 * Currency type definition
 */
export type CurrencyType = (typeof CURRENCY)[keyof typeof CURRENCY];
