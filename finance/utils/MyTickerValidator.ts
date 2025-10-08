import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

/**
 * MyTickerValidator
 * Validation utilities for MyTicker data
 */
export default class MyTickerValidator {
  /**
   * Validate MyTicker data
   * @param data - Partial MyTicker data to validate
   * @throws Error if validation fails
   */
  public static validate(data: Partial<MyTickerDataType>): void {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('UserID is required');
    }

    if (!data.exchangeId || !data.exchangeId.trim()) {
      throw new Error('ExchangeID is required');
    }

    if (!data.tickerId || !data.tickerId.trim()) {
      throw new Error('TickerID is required');
    }

    if (data.quantity === undefined || data.quantity === null) {
      throw new Error('Quantity is required');
    }

    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (data.averagePrice === undefined || data.averagePrice === null) {
      throw new Error('AveragePrice is required');
    }

    if (data.averagePrice <= 0) {
      throw new Error('AveragePrice must be greater than 0');
    }
  }

  /**
   * Validate MyTicker data and return error message if invalid
   * @param data - Partial MyTicker data to validate
   * @returns Error message if invalid, null if valid
   */
  public static validateWithMessage(data: Partial<MyTickerDataType>): string | null {
    try {
      this.validate(data);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Unknown validation error';
    }
  }
}
