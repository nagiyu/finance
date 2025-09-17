import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import ErrorUtil from '@common/utils/ErrorUtil';

export const SansenAkenomyojoConditionInfo: ConditionInfo = {
  name: '三川明けの明星',
  description: '三川明けの明星は、株価チャートにおける強気の反転パターンで、3本のローソク足で構成されます。最初のローソク足は長い陰線で、次に小さな陽線がギャップアップして出現し、最後にもう一つの陽線が続きます。このパターンは、売り圧力が弱まり、買い圧力が強まっていることを示唆し、価格の上昇を予測します。',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
};

export default class SansenAkenomyojoCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { count: 3, session });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return false;
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);

      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      // First candle should be a long bearish candle
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0]; // close < open
      const firstCandleSize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstIsLong = firstCandleSize > (firstCandle.data[3] - firstCandle.data[2]) * 0.6; // body is more than 60% of the range

      // Second candle should be a small bullish candle with a gap up
      const secondIsBullish = secondCandle.data[1] > secondCandle.data[0]; // close > open
      const secondCandleSize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmall = secondCandleSize < firstCandleSize * 0.5; // less than half the size of first candle
      const hasGapUp = firstCandle.data[2] > secondCandle.data[0]; // first candle's low > second candle's open

      // Third candle should be bullish
      const thirdIsBullish = thirdCandle.data[1] > thirdCandle.data[0]; // close > open

      if (firstIsBearish && firstIsLong && secondIsBullish && secondIsSmall && hasGapUp && thirdIsBullish) {
        return true;
      }

      return false;
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${SansenAkenomyojoConditionInfo.name}`, error);
    }
  }
}
