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
   * Look for converging trend lines where:
   * 1. Both highs and lows are rising
   * 2. The low trend line has a steeper angle than the high trend line
   * 3. Volume typically decreases during formation
   * 4. Price breaks below the lower trend line for confirmation
   */
  private detectRisingWedgePattern(candles: any[]): boolean {
    // Find significant highs and lows
    const highs = this.findSignificantHighs(candles);
    const lows = this.findSignificantLows(candles);

    if (highs.length < 3 || lows.length < 3) {
      return false;
    }

    // Get the most recent highs and lows for trend line analysis
    const recentHighs = highs.slice(-4); // Last 4 highs
    const recentLows = lows.slice(-4); // Last 4 lows

    if (recentHighs.length < 3 || recentLows.length < 3) {
      return false;
    }

    // Calculate trend lines
    const highTrendLine = this.calculateTrendLine(recentHighs);
    const lowTrendLine = this.calculateTrendLine(recentLows);

    if (!highTrendLine || !lowTrendLine) {
      return false;
    }

    // Check if both trend lines are rising (positive slope)
    if (highTrendLine.slope <= 0 || lowTrendLine.slope <= 0) {
      return false;
    }

    // Check if the low trend line has a steeper angle than the high trend line
    // This creates the converging wedge shape
    if (lowTrendLine.slope <= highTrendLine.slope) {
      return false;
    }

    // Check for convergence - lines should be getting closer
    const earlyHighs = recentHighs.slice(0, 2);
    const earlyLows = recentLows.slice(0, 2);
    const laterHighs = recentHighs.slice(-2);
    const laterLows = recentLows.slice(-2);

    const earlySpread = this.averagePrice(earlyHighs) - this.averagePrice(earlyLows);
    const laterSpread = this.averagePrice(laterHighs) - this.averagePrice(laterLows);

    // The spread should be narrowing (convergence)
    if (laterSpread >= earlySpread) {
      return false;
    }

    // Check for breakdown confirmation
    const currentCandle = candles[candles.length - 1];
    const currentLow = currentCandle.data[2]; // low price
    const currentClose = currentCandle.data[1]; // close price

    // Calculate the current level of the lower trend line
    const currentLowTrendLevel = this.getTrendLineValueAtIndex(lowTrendLine, candles.length - 1, recentLows[0].index);

    // Check if price has broken below the lower trend line
    const breakdownConfirmed = currentLow < currentLowTrendLevel || currentClose < currentLowTrendLevel;

    if (!breakdownConfirmed) {
      return false;
    }

    // Additional confirmation: check that breakdown is sustained
    // Look at the last 2-3 candles to ensure it's not just a brief spike
    let confirmationCount = 0;
    const lookBackCandles = Math.min(3, candles.length);
    
    for (let i = candles.length - lookBackCandles; i < candles.length; i++) {
      const candleLow = candles[i].data[2];
      const candleClose = candles[i].data[1];
      const trendLevel = this.getTrendLineValueAtIndex(lowTrendLine, i, recentLows[0].index);
      
      if (candleLow < trendLevel || candleClose < trendLevel) {
        confirmationCount++;
      }
    }

    // At least 2 out of the last 3 candles should confirm the breakdown
    return confirmationCount >= 2;
  }

  /**
   * Find significant highs in the price data
   */
  private findSignificantHighs(candles: any[]): Array<{index: number, price: number}> {
    const highs = [];
    const lookback = 2; // Look at 2 candles on each side

    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentHigh = candles[i].data[3]; // high price
      let isSignificantHigh = true;

      // Check if this is a local maximum
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].data[3] >= currentHigh) {
          isSignificantHigh = false;
          break;
        }
      }

      if (isSignificantHigh) {
        highs.push({ index: i, price: currentHigh });
      }
    }

    return highs;
  }

  /**
   * Find significant lows in the price data
   */
  private findSignificantLows(candles: any[]): Array<{index: number, price: number}> {
    const lows = [];
    const lookback = 2; // Look at 2 candles on each side

    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentLow = candles[i].data[2]; // low price
      let isSignificantLow = true;

      // Check if this is a local minimum
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].data[2] <= currentLow) {
          isSignificantLow = false;
          break;
        }
      }

      if (isSignificantLow) {
        lows.push({ index: i, price: currentLow });
      }
    }

    return lows;
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

  /**
   * Get the trend line value at a specific index
   */
  private getTrendLineValueAtIndex(trendLine: {slope: number, intercept: number}, index: number, baseIndex: number): number {
    return trendLine.intercept + trendLine.slope * index;
  }

  /**
   * Calculate average price of a set of points
   */
  private averagePrice(points: Array<{index: number, price: number}>): number {
    if (points.length === 0) return 0;
    return points.reduce((sum, point) => sum + point.price, 0) / points.length;
  }
}