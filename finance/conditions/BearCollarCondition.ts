import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const BearCollarConditionInfo: ConditionInfo = {
  name: 'ベアコラッグ',
  description: 'ベアコラッグ（Bear Collar）は、保有株式の下値リスクを制限しつつ上昇利益を一定範囲に制限するヘッジ戦略です。株価が急落した際の損失を限定し、同時にオプションプレミアムでコストを抑制することができます。このパターンは保有株式の価格が設定した下限（プット行使価格）に近づいた時や、上限（コール行使価格）に近づいた時に通知されます。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: true,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class BearCollarCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      if (targetPrice === null || targetPrice === undefined) {
        throw new Error('Target price is required for BearCollarCondition');
      }

      const currentPrice = await this.getCurrentStockPrice(exchangeId, tickerId, session);
      if (currentPrice === null) {
        throw new Error('Failed to retrieve current stock price');
      }

      // Get historical data to analyze volatility and price movements
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { 
        count: 20, 
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 5) {
        return false;
      }

      // Calculate recent volatility (using last 20 periods)
      const prices = stockData.slice(-20).map(candle => candle.data[1]); // closing prices
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance) / avgPrice; // coefficient of variation

      // Bear Collar conditions:
      // 1. High volatility (suggesting need for hedging)
      // 2. Current price near target price (could be put strike or call strike)
      // 3. Recent downward pressure or approaching resistance levels
      
      const highVolatility = volatility > 0.02; // 2% volatility threshold
      const nearTargetPrice = Math.abs(currentPrice - targetPrice) / currentPrice < 0.05; // within 5% of target

      // Check for recent downward pressure (bear signal)
      const recentCandles = stockData.slice(-5);
      let bearishCandles = 0;
      for (const candle of recentCandles) {
        if (candle.data[1] < candle.data[0]) { // close < open (bearish)
          bearishCandles++;
        }
      }
      const bearishPressure = bearishCandles >= 3; // 3 out of 5 recent candles are bearish

      // Check if price is approaching support/resistance levels
      const prices10 = stockData.slice(-10).map(candle => candle.data[1]);
      const maxPrice = Math.max(...prices10);
      const minPrice = Math.min(...prices10);
      const range = maxPrice - minPrice;
      const approachingBoundary = (currentPrice - minPrice) / range < 0.2 || (maxPrice - currentPrice) / range < 0.2;

      // Bear Collar signal: high volatility + near target price + (bearish pressure OR approaching boundary)
      if (highVolatility && nearTargetPrice && (bearishPressure || approachingBoundary)) {
        return true;
      }

      return false;
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${BearCollarConditionInfo.name}`, error);
    }
  }
}