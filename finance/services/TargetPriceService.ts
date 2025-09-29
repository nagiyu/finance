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
    const buyTargetPrice = averagePrice * input.buyTolerance;
    const sellTargetPrice = averagePrice * input.sellTolerance;

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
   * @param buyTolerance Tolerance for buy condition (e.g., 0.9)
   * @param sellTolerance Tolerance for sell condition (e.g., 1.1)
   * @param currency Currency of the input values
   * @param targetCurrency Target currency for conversion (optional)
   * @returns Target price calculation result
   */
  public static calculateTargetPriceFromHoldings(
    currentQuantity: number,
    totalCost: number,
    buyTolerance: number,
    sellTolerance: number,
    currency: 'JPY' | 'USD',
    targetCurrency?: 'JPY' | 'USD'
  ): TargetPriceCalculationResult {
    return this.calculateTargetPrice({
      currentQuantity,
      totalCost,
      buyTolerance,
      sellTolerance,
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
      throw new Error('Current quantity must be greater than 0');
    }

    if (input.totalCost <= 0) {
      throw new Error('Total cost must be greater than 0');
    }

    if (input.buyTolerance <= 0) {
      throw new Error('Buy tolerance must be greater than 0');
    }

    if (input.sellTolerance <= 0) {
      throw new Error('Sell tolerance must be greater than 0');
    }

    if (input.buyTolerance >= input.sellTolerance) {
      throw new Error('Buy tolerance must be less than sell tolerance');
    }

    if (!['JPY', 'USD'].includes(input.currency)) {
      throw new Error('Currency must be either JPY or USD');
    }

    if (input.targetCurrency && !['JPY', 'USD'].includes(input.targetCurrency)) {
      throw new Error('Target currency must be either JPY or USD');
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
    targetCurrency: 'JPY' | 'USD'
  ): TargetPriceCalculationResult {
    const sourceCurrency = result.currency;
    
    if (sourceCurrency === targetCurrency) {
      return result;
    }

    let convertedAveragePrice: number;
    let convertedBuyTargetPrice: number;
    let convertedSellTargetPrice: number;
    let exchangeRate: number;

    if (sourceCurrency === 'USD' && targetCurrency === 'JPY') {
      exchangeRate = this.USD_TO_JPY_RATE;
      convertedAveragePrice = this.convertUsdToJpy(result.averagePrice);
      convertedBuyTargetPrice = this.convertUsdToJpy(result.buyTargetPrice);
      convertedSellTargetPrice = this.convertUsdToJpy(result.sellTargetPrice);
    } else if (sourceCurrency === 'JPY' && targetCurrency === 'USD') {
      exchangeRate = this.JPY_TO_USD_RATE;
      convertedAveragePrice = this.convertJpyToUsd(result.averagePrice);
      convertedBuyTargetPrice = this.convertJpyToUsd(result.buyTargetPrice);
      convertedSellTargetPrice = this.convertJpyToUsd(result.sellTargetPrice);
    } else {
      throw new Error(`Unsupported currency conversion: ${sourceCurrency} to ${targetCurrency}`);
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