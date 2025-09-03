import * as TradingView from '@mathieuc/tradingview';
import { PricePeriod, TimeFrame } from '@mathieuc/tradingview';

import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';

export type { TimeFrame } from '@mathieuc/tradingview';

export interface GetStockPriceDataOptions {
  count?: number;      // 取得件数（デフォルト: 30）
  timeframe?: TimeFrame;  // タイムフレーム（デフォルト: '1'）
}

export default class FinanceUtil {
  public static getFinanceTableName(): string {
    switch (EnvironmentalUtil.GetProcessEnv()) {
      case 'local':
      case 'development':
        return 'DevFinance';
      case 'production':
        return 'Finance';
      default:
        return 'DevFinance';
    }
  }

  public static async getStockPriceData(exchange: string, ticker: string, options?: GetStockPriceDataOptions): Promise<any> {
    const market = `${exchange}:${ticker}`;
    const count = options?.count ?? 30;
    const timeframe: TimeFrame = options?.timeframe ?? '1';

    const result = await new Promise((resolve, reject) => {
      const client = new TradingView.Client();
      const chart = new client.Session.Chart();

      chart.setMarket(market, {
        timeframe: timeframe,
      });

      chart.onError((...err) => { // Listen for errors (can avoid crash)
        console.error('Chart error:', ...err);

        chart.delete();
        client.end();

        reject(err);
      });

      chart.onUpdate(() => { // When price changes
        if (!chart.periods[0]) {
          chart.delete();
          client.end();

          reject('データがありません');

          return;
        }

        // periodsは新しい順なので、指定件数を昇順に並べ替え
        const periods = (chart.periods.slice(0, count) as PricePeriod[]).reverse();
        const data = periods.map((p) => ({
          date: p.time
            ? new Date(p.time * 1000).toISOString().slice(0, 16).replace('T', ' ')
            : "",
          data: [
            p.open ?? 0,
            p.close ?? 0,
            p.min ?? 0,
            p.max ?? 0
          ]
        }));

        chart.delete();
        client.end();

        resolve(data);
      });
    });

    return result;
  }

  /**
   * Get the current stock price for a given exchange and ticker
   * Returns the latest close price
   */
  public static async getCurrentStockPrice(exchange: string, ticker: string): Promise<number | null> {
    try {
      const stockData = await this.getStockPriceData(exchange, ticker, { count: 1 });

      if (!stockData || !Array.isArray(stockData) || stockData.length === 0) {
        return null;
      }

      // Get the latest price (close price from the most recent data)
      const latestData = stockData[stockData.length - 1];
      return latestData.data[1]; // Close price
    } catch (error) {
      console.error('Error getting current stock price:', error);
      return null;
    }
  }
}
