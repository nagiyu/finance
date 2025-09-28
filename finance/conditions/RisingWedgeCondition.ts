import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const RisingWedgeConditionInfo: ConditionInfo = {
  name: '上昇ウェッジ',
  description: '上昇ウェッジ（Rising Wedge）は、株価チャートにおける代表的な「弱気パターン」の一つです。高値と安値の両方が切り上がっていくものの、安値ラインの上昇角度が高値ラインより急になるため、チャートが先細りの「くさび型（ウェッジ）」になります。一見すると上昇基調に見えますが、上値の伸びが弱く、買い圧力より売り圧力が強まっている兆候とされます。多くの場合、下方にブレイクすると強い下落につながりやすいとされています。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
};

export default class RisingWedgeCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { 
        count: 25, // Need enough data points to detect the wedge pattern
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-25);
      
      // Detect rising wedge pattern
      return this.detectRisingWedgePattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${RisingWedgeConditionInfo.name}`, error);
    }
  }

  /**
   * Detect rising wedge pattern
   * Simplified approach focusing on key characteristics:
   * 1. Both highs and lows are generally rising in early/mid stages
   * 2. Price range is converging (narrowing wedge)
   * 3. Recent breakdown below support trend line
   */
  private detectRisingWedgePattern(candles: any[]): boolean {
    if (candles.length < 15) {
      return false;
    }

    // Analyze different sections of the data
    const firstThird = candles.slice(0, Math.floor(candles.length / 3));
    const middleThird = candles.slice(Math.floor(candles.length / 3), Math.floor(candles.length * 2 / 3));
    const lastThird = candles.slice(Math.floor(candles.length * 2 / 3));

    // Get high and low values for each section
    const firstHigh = Math.max(...firstThird.map(c => c.data[3]));
    const firstLow = Math.min(...firstThird.map(c => c.data[2]));
    
    const middleHigh = Math.max(...middleThird.map(c => c.data[3]));
    const middleLow = Math.min(...middleThird.map(c => c.data[2]));

    const lastHigh = Math.max(...lastThird.slice(0, -5).map(c => c.data[3])); // Exclude breakdown candles
    const lastLow = Math.min(...lastThird.slice(0, -5).map(c => c.data[2])); // Exclude breakdown candles

    // Check for rising pattern: both highs and lows should generally increase
    const highsRising = middleHigh > firstHigh && lastHigh >= middleHigh;
    const lowsRising = middleLow > firstLow && lastLow >= middleLow;

    if (!highsRising || !lowsRising) {
      return false;
    }

    // Check for convergence: the spread should be narrowing
    const firstSpread = firstHigh - firstLow;
    const middleSpread = middleHigh - middleLow;
    const lastSpread = lastHigh - lastLow;

    // Pattern should show convergence (narrowing wedge)
    if (lastSpread >= firstSpread || lastSpread >= middleSpread) {
      return false;
    }

    // Check for breakdown in recent candles
    const recentCandles = lastThird.slice(-6); // Last 6 candles
    const supportLevel = this.calculateSimpleSupport(candles.slice(-12, -2)); // Support from recent but not breakdown candles

    if (supportLevel === null) {
      return false;
    }

    // Count breakdown candles
    let breakdownCount = 0;
    for (const candle of recentCandles) {
      if (candle.data[2] < supportLevel || candle.data[1] < supportLevel) { // low or close below support
        breakdownCount++;
      }
    }

    // At least half of recent candles should show breakdown
    return breakdownCount >= Math.ceil(recentCandles.length / 2);
  }

  /**
   * Calculate simple support level from recent lows
   */
  private calculateSimpleSupport(candles: any[]): number | null {
    if (candles.length < 5) {
      return null;
    }

    // Find the lowest lows in the period and use them as support
    const lows = candles.map(c => c.data[2]); // low prices
    lows.sort((a, b) => a - b);
    
    // Use average of lowest 30% of lows as support level
    const supportLows = lows.slice(0, Math.max(1, Math.floor(lows.length * 0.3)));
    return supportLows.reduce((sum, low) => sum + low, 0) / supportLows.length;
  }

  /**
   * Calculate trend line using linear regression
   */
  private calculateTrendLine(points: Array<{index: number, price: number}>): {slope: number, intercept: number} | null {
    if (points.length < 2) {
      return null;
    }

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (const point of points) {
      sumX += point.index;
      sumY += point.price;
      sumXY += point.index * point.price;
      sumXX += point.index * point.index;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }
}