import { GetStockPriceDataOptions } from '@finance/utils/FinanceUtil';

export default class FinanceUtilMock {
  public static StockPriceDataMock: any[] = [];

  public static async getStockPriceData(exchange: string, ticker: string, options?: GetStockPriceDataOptions): Promise<any> {
    return this.StockPriceDataMock;
  }

  public static async getCurrentStockPrice(exchange: string, ticker: string, session?: string): Promise<number | null> {
    const latestData = this.StockPriceDataMock[this.StockPriceDataMock.length - 1];
    return latestData.data[1];
  }
}
