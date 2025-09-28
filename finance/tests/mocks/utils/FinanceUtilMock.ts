import { GetStockPriceDataOptions } from '@finance/utils/FinanceUtil';

export default class FinanceUtilMock {
  public static StockPriceDataMock: any[] = [];

  public static async getStockPriceData(exchange: string, ticker: string, options?: GetStockPriceDataOptions): Promise<any> {
    const count = options?.count ?? 30;
    // Return the last 'count' items from the mock data, simulating real behavior
    return this.StockPriceDataMock.slice(-count);
  }

  public static async getCurrentStockPrice(exchange: string, ticker: string, session?: string): Promise<number | null> {
    const latestData = this.StockPriceDataMock[this.StockPriceDataMock.length - 1];
    return latestData.data[1];
  }
}
