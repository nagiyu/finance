import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import { MyTickerSummaryDataType } from '@/interfaces/data/MyTickerSummaryDataType';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

export default class MyTickerSummaryUtil {
  /**
   * Calculate current stock holdings summary from MyTicker data
   * Since MyTicker now stores current state (not transactions), this is a simple mapping
   */
  public static calculateSummary(
    myTickers: MyTickerDataType[],
    exchanges: ExchangeDataType[],
    tickers: TickerDataType[]
  ): MyTickerSummaryDataType[] {
    const summary: MyTickerSummaryDataType[] = myTickers
      .filter(item => item.quantity > 0) // Only include items with positive quantity
      .map(item => {
        const exchange = exchanges.find(ex => ex.id === item.exchangeId);
        const ticker = tickers.find(t => t.id === item.tickerId);
        
        return {
          tickerId: item.tickerId,
          exchangeId: item.exchangeId,
          tickerName: ticker?.name || 'Unknown',
          exchangeName: exchange?.name || 'Unknown',
          currentQuantity: item.quantity,
          totalCost: item.quantity * item.averagePrice,
          averagePrice: item.averagePrice
        };
      })
      .sort((a, b) => a.tickerName.localeCompare(b.tickerName));

    return summary;
  }
}