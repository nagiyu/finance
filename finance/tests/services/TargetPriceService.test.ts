import { CURRENCY } from '@finance/consts/CurrencyConst';
import TargetPriceService from '@finance/services/TargetPriceService';
import { TargetPriceCalculationInput } from '@finance/interfaces/data/TargetPriceDataType';

describe('TargetPriceService', () => {
  describe('calculateTargetPrice', () => {
    it('should calculate target prices correctly for JPY', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: 150000, // 1500 JPY per share
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.JPY
      };

      const result = TargetPriceService.calculateTargetPrice(input);

      expect(result.averagePrice).toBe(1500);
      expect(result.buyTargetPrice).toBe(1350); // 1500 * 0.9
      expect(result.sellTargetPrice).toBeCloseTo(1650, 5); // 1500 * 1.1
      expect(result.currency).toBe(CURRENCY.JPY);
      expect(result.originalCurrency).toBeUndefined();
      expect(result.exchangeRate).toBeUndefined();
    });

    it('should calculate target prices correctly for USD', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 50,
        totalCost: 2500, // $50 per share
        buyTolerance: 0.95,
        sellTolerance: 1.05,
        currency: CURRENCY.USD
      };

      const result = TargetPriceService.calculateTargetPrice(input);

      expect(result.averagePrice).toBe(50);
      expect(result.buyTargetPrice).toBe(47.5); // 50 * 0.95
      expect(result.sellTargetPrice).toBe(52.5); // 50 * 1.05
      expect(result.currency).toBe(CURRENCY.USD);
    });

    it('should convert from USD to JPY when target currency is specified', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 10,
        totalCost: 1000, // $100 per share
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.USD,
        targetCurrency: CURRENCY.JPY
      };

      const result = TargetPriceService.calculateTargetPrice(input);

      // Average price: $100 -> ¥14,300 (143.0 rate)
      expect(result.averagePrice).toBe(14300);
      expect(result.buyTargetPrice).toBe(12870); // ¥14,300 * 0.9
      expect(result.sellTargetPrice).toBe(15730); // ¥14,300 * 1.1
      expect(result.currency).toBe(CURRENCY.JPY);
      expect(result.originalCurrency).toBe(CURRENCY.USD);
      expect(result.exchangeRate).toBe(143.0);
    });

    it('should convert from JPY to USD when target currency is specified', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: 143000, // ¥1430 per share
        buyTolerance: 0.8,
        sellTolerance: 1.2,
        currency: CURRENCY.JPY,
        targetCurrency: CURRENCY.USD
      };

      const result = TargetPriceService.calculateTargetPrice(input);

      // Average price: ¥1430 -> $10.01 (0.007 rate)
      expect(result.averagePrice).toBe(10.01);
      expect(result.buyTargetPrice).toBe(8.01); // $10.01 * 0.8
      expect(result.sellTargetPrice).toBe(12.01); // $10.01 * 1.2
      expect(result.currency).toBe(CURRENCY.USD);
      expect(result.originalCurrency).toBe(CURRENCY.JPY);
      expect(result.exchangeRate).toBe(0.007);
    });

    it('should handle decimal quantities correctly', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 33.5,
        totalCost: 5025, // 150 per share
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.USD
      };

      const result = TargetPriceService.calculateTargetPrice(input);

      expect(result.averagePrice).toBeCloseTo(150, 2);
      expect(result.buyTargetPrice).toBeCloseTo(135, 2); // 150 * 0.9
      expect(result.sellTargetPrice).toBeCloseTo(165, 2); // 150 * 1.1
    });
  });

  describe('calculateTargetPriceFromHoldings', () => {
    it('should work as a convenience method', () => {
      const result = TargetPriceService.calculateTargetPriceFromHoldings(
        200,
        30000,
        0.85,
        1.15,
        CURRENCY.JPY
      );

      expect(result.averagePrice).toBe(150);
      expect(result.buyTargetPrice).toBe(127.5); // 150 * 0.85
      expect(result.sellTargetPrice).toBe(172.5); // 150 * 1.15
      expect(result.currency).toBe(CURRENCY.JPY);
    });

    it('should work with currency conversion', () => {
      const result = TargetPriceService.calculateTargetPriceFromHoldings(
        100,
        10000,
        0.9,
        1.1,
        CURRENCY.USD,
        CURRENCY.JPY
      );

      expect(result.averagePrice).toBe(14300); // $100 -> ¥14,300
      expect(result.currency).toBe(CURRENCY.JPY);
      expect(result.originalCurrency).toBe(CURRENCY.USD);
    });
  });

  describe('input validation', () => {
    it('should throw error for zero or negative current quantity', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 0,
        totalCost: 1000,
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.JPY
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Current quantity must be greater than 0');
    });

    it('should throw error for zero or negative total cost', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: -1000,
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.JPY
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Total cost must be greater than 0');
    });

    it('should throw error for zero or negative buy tolerance', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: 1000,
        buyTolerance: 0,
        sellTolerance: 1.1,
        currency: CURRENCY.JPY
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Buy tolerance must be greater than 0');
    });

    it('should throw error for zero or negative sell tolerance', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: 1000,
        buyTolerance: 0.9,
        sellTolerance: -1.1,
        currency: CURRENCY.JPY
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Sell tolerance must be greater than 0');
    });

    it('should throw error when buy tolerance is greater than or equal to sell tolerance', () => {
      const input: TargetPriceCalculationInput = {
        currentQuantity: 100,
        totalCost: 1000,
        buyTolerance: 1.1,
        sellTolerance: 0.9,
        currency: CURRENCY.JPY
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Buy tolerance must be less than sell tolerance');
    });

    it('should throw error for invalid currency', () => {
      const input: any = {
        currentQuantity: 100,
        totalCost: 1000,
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: 'EUR'
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Currency must be either JPY or USD');
    });

    it('should throw error for invalid target currency', () => {
      const input: any = {
        currentQuantity: 100,
        totalCost: 1000,
        buyTolerance: 0.9,
        sellTolerance: 1.1,
        currency: CURRENCY.JPY,
        targetCurrency: 'EUR'
      };

      expect(() => TargetPriceService.calculateTargetPrice(input))
        .toThrow('Target currency must be either JPY or USD');
    });
  });
});