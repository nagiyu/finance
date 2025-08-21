import EnvironmentalUtil from '@common/utils/EnvironmentalUtil';
import TradingView, { PricePeriod } from '@mathieuc/tradingview';

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

  public static async getStockPriceData(exchange: string, ticker: string): Promise<any> {
    const market = `${exchange}:${ticker}`;

    const result = await new Promise((resolve, reject) => {
      const client = new TradingView.Client();
      const chart = new client.Session.Chart();

      chart.setMarket(market, {
        timeframe: '1',
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

        // periodsは新しい順なので、直近30本を昇順に並べ替え
        const periods = (chart.periods.slice(0, 30) as PricePeriod[]).reverse();
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
}
