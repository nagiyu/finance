import FinanceUtil from '@finance/utils/FinanceUtil';

describe('FinanceUtil', () => {
  describe('getFinanceTableName', () => {
    it('should return DevFinance for local environment', () => {
      expect(FinanceUtil.getFinanceTableName()).toBe('DevFinance');
    });
  });

  describe('getStockPriceData', () => {
    it('should fetch stock price data', async () => {
      const data = await FinanceUtil.getStockPriceData('NASDAQ', 'AAPL', { count: 5, timeframe: '5' });
      expect(data).toBeDefined();
      expect(data.length).toBeLessThanOrEqual(5);
    });
  });
});
