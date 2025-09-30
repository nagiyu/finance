import { CurrencyType } from '@finance/consts/CurrencyConst';

/**
 * Interface for TargetPrice calculation input parameters
 */
export interface TargetPriceCalculationInput {
  /**
   * Current quantity of stocks held
   */
  currentQuantity: number;

  /**
   * Total cost of current holdings
   */
  totalCost: number;

  /**
   * Tolerance range for buy condition (e.g., 0.9 for 90%)
   */
  buyTolerance: number;

  /**
   * Tolerance range for sell condition (e.g., 1.1 for 110%)
   */
  sellTolerance: number;

  /**
   * Currency type: 'JPY' or 'USD'
   */
  currency: CurrencyType;

  /**
   * Target currency for conversion (optional)
   * If specified, result will be converted to this currency
   */
  targetCurrency?: CurrencyType;
}

/**
 * Interface for TargetPrice calculation result
 */
export interface TargetPriceCalculationResult {
  /**
   * Average purchase price per share
   */
  averagePrice: number;

  /**
   * Target price for buy condition (lower than average)
   */
  buyTargetPrice: number;

  /**
   * Target price for sell condition (higher than average)
   */
  sellTargetPrice: number;

  /**
   * Currency of the calculated prices
   */
  currency: CurrencyType;

  /**
   * Original currency before conversion (if conversion was applied)
   */
  originalCurrency?: CurrencyType;

  /**
   * Exchange rate used for conversion (if conversion was applied)
   */
  exchangeRate?: number;
}