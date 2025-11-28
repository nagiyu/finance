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
   * Tolerance multiplier to apply to average price (e.g., 0.1 for ±10%)
   * This creates a range: average * (1 - tolerance) to average * (1 + tolerance)
   */
  tolerance: number;

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
