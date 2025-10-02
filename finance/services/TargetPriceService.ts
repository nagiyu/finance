import ErrorUtil from '@common/utils/ErrorUtil';
import { CURRENCY, CurrencyType } from '@finance/consts/CurrencyConst';
import { TargetPriceCalculationInput, TargetPriceCalculationResult } from '@finance/interfaces/data/TargetPriceDataType';

/**
 * Service for calculating target prices based on current holdings
 */
export default class TargetPriceService {
  // Fixed exchange rates (same as CurrencyUtil)
  private static readonly USD_TO_JPY_RATE = 143.0;
  private static readonly JPY_TO_USD_RATE = 0.007;
  
  /**
   * Calculate target prices for buy and sell conditions based on current holdings
   * @param input Input parameters for target price calculation
   * @returns Target price calculation result
   */
  public static calculateTargetPrice(input: TargetPriceCalculationInput): TargetPriceCalculationResult {
    // Validate input
    this.validateInput(input);

    // Calculate average price per share
    const averagePrice = input.totalCost / input.currentQuantity;

    // Calculate target prices based on tolerance
    // Buy target: average * (1 - tolerance)
    // Sell target: average * (1 + tolerance)
    const buyTargetPrice = averagePrice * (1 - input.tolerance);
    const sellTargetPrice = averagePrice * (1 + input.tolerance);

    // Apply currency conversion if needed
    if (input.targetCurrency && input.targetCurrency !== input.currency) {
      return this.convertCurrency({
        averagePrice,
        buyTargetPrice,
        sellTargetPrice,
        currency: input.currency,
        originalCurrency: input.currency
      }, input.targetCurrency);
    }

    return {
      averagePrice,
      buyTargetPrice,
      sellTargetPrice,
      currency: input.currency
    };
  }

  /**
   * Calculate target price from MyTickerSummary data
   * @param currentQuantity Current quantity of stocks held
   * @param totalCost Total cost of current holdings
   * @param tolerance Tolerance multiplier (e.g., 0.1 for ±10%)
   * @param currency Currency of the input values
   * @param targetCurrency Target currency for conversion (optional)
   * @returns Target price calculation result
   */
  public static calculateTargetPriceFromHoldings(
    currentQuantity: number,
    totalCost: number,
    tolerance: number,
    currency: CurrencyType,
    targetCurrency?: CurrencyType
  ): TargetPriceCalculationResult {
    return this.calculateTargetPrice({
      currentQuantity,
      totalCost,
      tolerance,
      currency,
      targetCurrency
    });
  }

  /**
   * Validate input parameters
   * @param input Input parameters to validate
   */
  private static validateInput(input: TargetPriceCalculationInput): void {
    if (input.currentQuantity <= 0) {
      ErrorUtil.throwError('Current quantity must be greater than 0');
    }

    if (input.totalCost <= 0) {
      ErrorUtil.throwError('Total cost must be greater than 0');
    }

    if (input.tolerance < 0 || input.tolerance >= 1) {
      ErrorUtil.throwError('Tolerance must be between 0 and 1 (exclusive of 1)');
    }

    if (!Object.values(CURRENCY).includes(input.currency)) {
      ErrorUtil.throwError('Currency must be either JPY or USD');
    }

    if (input.targetCurrency && !Object.values(CURRENCY).includes(input.targetCurrency)) {
      ErrorUtil.throwError('Target currency must be either JPY or USD');
    }
  }

  /**
   * Convert prices to target currency
   * @param result Original calculation result
   * @param targetCurrency Target currency for conversion
   * @returns Converted calculation result
   */
  private static convertCurrency(
    result: TargetPriceCalculationResult,
    targetCurrency: CurrencyType
  ): TargetPriceCalculationResult {
    const sourceCurrency = result.currency;
    
    if (sourceCurrency === targetCurrency) {
      return result;
    }

    let convertedAveragePrice: number;
    let convertedBuyTargetPrice: number;
    let convertedSellTargetPrice: number;
    let exchangeRate: number;

    if (sourceCurrency === CURRENCY.USD && targetCurrency === CURRENCY.JPY) {
      exchangeRate = this.USD_TO_JPY_RATE;
      convertedAveragePrice = this.convertUsdToJpy(result.averagePrice);
      convertedBuyTargetPrice = this.convertUsdToJpy(result.buyTargetPrice);
      convertedSellTargetPrice = this.convertUsdToJpy(result.sellTargetPrice);
    } else if (sourceCurrency === CURRENCY.JPY && targetCurrency === CURRENCY.USD) {
      exchangeRate = this.JPY_TO_USD_RATE;
      convertedAveragePrice = this.convertJpyToUsd(result.averagePrice);
      convertedBuyTargetPrice = this.convertJpyToUsd(result.buyTargetPrice);
      convertedSellTargetPrice = this.convertJpyToUsd(result.sellTargetPrice);
    } else {
      ErrorUtil.throwError(`Unsupported currency conversion: ${sourceCurrency} to ${targetCurrency}`);
    }

    return {
      averagePrice: convertedAveragePrice,
      buyTargetPrice: convertedBuyTargetPrice,
      sellTargetPrice: convertedSellTargetPrice,
      currency: targetCurrency,
      originalCurrency: sourceCurrency,
      exchangeRate
    };
  }

  /**
   * Convert USD to JPY
   * @param usdAmount Amount in USD
   * @returns Amount in JPY
   */
  private static convertUsdToJpy(usdAmount: number): number {
    return Math.round(usdAmount * this.USD_TO_JPY_RATE * 100) / 100;
  }

  /**
   * Convert JPY to USD
   * @param jpyAmount Amount in JPY
   * @returns Amount in USD
   */
  private static convertJpyToUsd(jpyAmount: number): number {
    return Math.round(jpyAmount * this.JPY_TO_USD_RATE * 100) / 100;
  }
}