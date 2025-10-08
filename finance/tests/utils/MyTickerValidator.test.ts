import MyTickerValidator from '@finance/utils/MyTickerValidator';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

describe('MyTickerValidator', () => {
  describe('validate', () => {
    it('should pass validation for valid MyTicker data', () => {
      const validData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(validData)).not.toThrow();
    });

    it('should throw error when userId is missing', () => {
      const invalidData: Partial<MyTickerDataType> = {
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('UserID is required');
    });

    it('should throw error when userId is empty string', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: '   ',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('UserID is required');
    });

    it('should throw error when exchangeId is missing', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('ExchangeID is required');
    });

    it('should throw error when tickerId is missing', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        quantity: 10,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('TickerID is required');
    });

    it('should throw error when quantity is missing', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('Quantity is required');
    });

    it('should throw error when quantity is zero', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 0,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('Quantity must be greater than 0');
    });

    it('should throw error when quantity is negative', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: -5,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('Quantity must be greater than 0');
    });

    it('should throw error when averagePrice is missing', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('AveragePrice is required');
    });

    it('should throw error when averagePrice is zero', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 0,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('AveragePrice must be greater than 0');
    });

    it('should throw error when averagePrice is negative', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: -100,
      };

      expect(() => MyTickerValidator.validate(invalidData)).toThrow('AveragePrice must be greater than 0');
    });

    it('should accept fractional quantity', () => {
      const validData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 0.5,
        averagePrice: 150.5,
      };

      expect(() => MyTickerValidator.validate(validData)).not.toThrow();
    });

    it('should accept fractional averagePrice', () => {
      const validData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.75,
      };

      expect(() => MyTickerValidator.validate(validData)).not.toThrow();
    });
  });

  describe('validateWithMessage', () => {
    it('should return null for valid data', () => {
      const validData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: 10,
        averagePrice: 150.5,
      };

      const result = MyTickerValidator.validateWithMessage(validData);
      expect(result).toBeNull();
    });

    it('should return error message for invalid data', () => {
      const invalidData: Partial<MyTickerDataType> = {
        userId: 'user123',
        exchangeId: 'NYSE',
        tickerId: 'AAPL',
        quantity: -10,
        averagePrice: 150.5,
      };

      const result = MyTickerValidator.validateWithMessage(invalidData);
      expect(result).toBe('Quantity must be greater than 0');
    });
  });
});
