import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const SansenYoinomyojoConditionInfo: ConditionInfo = {
  name: '三川宵の明星',
  description: '三川宵の明星は、株価チャートにおける弱気の反転パターンで、3本のローソク足で構成されます。最初のローソク足は長い陽線で、次に小さな陰線または十字線がギャップアップして出現し、最後に大きな陰線が続きます。このパターンは、買い圧力が弱まり、売り圧力が強まっていることを示唆し、価格の下落を予測します。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class SansenYoinomyojoCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { 
        count: 3, 
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return false;
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);

      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      // First candle should be a long bullish candle
      const firstIsBullish = firstCandle.data[1] > firstCandle.data[0]; // close > open
      const firstCandleSize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstIsLong = firstCandleSize > (firstCandle.data[3] - firstCandle.data[2]) * 0.6; // body is more than 60% of the range

      // Second candle should be a small bearish candle or doji with a gap up
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0]; // close < open
      const secondCandleSize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmall = secondCandleSize < firstCandleSize * 0.5; // less than half the size of first candle
      const hasGapUp = secondCandle.data[2] > firstCandle.data[3]; // second candle's low > first candle's high

      // Third candle should be a large bearish candle
      const thirdIsBearish = thirdCandle.data[1] < thirdCandle.data[0]; // close < open
      const thirdCandleSize = Math.abs(thirdCandle.data[1] - thirdCandle.data[0]);
      const thirdIsLarge = thirdCandleSize > secondCandleSize * 1.5; // significantly larger than second candle

      if (firstIsBullish && firstIsLong && secondIsBearish && secondIsSmall && hasGapUp && thirdIsBearish && thirdIsLarge) {
        return true;
      }

      return false;
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${SansenYoinomyojoConditionInfo.name}`, error);
    }
  }
}