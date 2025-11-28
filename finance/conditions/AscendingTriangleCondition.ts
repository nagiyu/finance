import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const AscendingTriangleConditionInfo: ConditionInfo = {
  name: 'アセンディング・トライアングル',
  description:
    'アセンディング・トライアングル（Ascending Triangle）は、上昇型三角持ち合いと呼ばれる強気の継続パターンです。価格が徐々に上昇している下値支持線と、ほぼ水平な上値抵抗線が収束する三角形の形を作ります。買い勢力が徐々に強まっていることを示し、最終的に上値抵抗線を上抜けることで強い上昇トレンドが期待されます。パターンの完成には水平抵抗線での複数回の跳ね返り、段階的に切り上がる安値、そして抵抗線の上方ブレイクアウトが必要です。',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class AscendingTriangleCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, {
        count: 20, // Need enough data points to detect the triangle pattern
        session,
        timeframe: timeframe || '1',
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-20);

      // Detect ascending triangle pattern
      return this.detectAscendingTrianglePattern(candles);
    } catch (error) {
      ErrorUtil.throwError(
        `Error checking condition ${AscendingTriangleConditionInfo.name}`,
        error
      );
    }
  }

  /**
   * Detect ascending triangle pattern
   * Key characteristics:
   * 1. Horizontal resistance line (highs at roughly same level)
   * 2. Rising support line (lows getting progressively higher)
   * 3. Convergence towards apex
   * 4. Breakout above resistance line
   */
  private detectAscendingTrianglePattern(candles: any[]): boolean {
    if (candles.length < 15) {
      return false;
    }

    // Find significant highs and lows
    const highs = this.findSignificantHighs(candles);
    const lows = this.findSignificantLows(candles);

    if (highs.length < 2 || lows.length < 2) {
      return false;
    }

    // Check for horizontal resistance line
    const resistanceLevel = this.findHorizontalResistance(highs);
    if (resistanceLevel === null) {
      return false;
    }

    // Check for rising support line
    const supportTrend = this.calculateSupportTrend(lows);
    if (supportTrend === null || supportTrend.slope <= 0) {
      return false;
    }

    // Verify pattern convergence
    if (!this.verifyPatternConvergence(candles, resistanceLevel, supportTrend)) {
      return false;
    }

    // Check for breakout above resistance
    return this.checkBreakoutAboveResistance(candles, resistanceLevel);
  }

  /**
   * Find significant highs (local peaks)
   */
  private findSignificantHighs(candles: any[]): Array<{ index: number; price: number }> {
    const highs = [];
    const minDistance = 2; // Minimum distance between peaks

    for (let i = minDistance; i < candles.length - minDistance; i++) {
      const currentHigh = candles[i].data[3]; // high price
      let isSignificantHigh = true;

      // Check if this is higher than surrounding candles
      for (let j = i - minDistance; j <= i + minDistance; j++) {
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
   * Find support points for ascending triangle
   * Instead of strict local minima, find points where price bounced off support
   */
  private findSignificantLows(candles: any[]): Array<{ index: number; price: number }> {
    const lows = [];
    const lookback = 3; // Look for pullbacks/bounces

    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentLow = candles[i].data[2]; // low price
      const currentClose = candles[i].data[1]; // close price

      // Look for bounce pattern: price drops then recovers
      let isPullbackLow = false;

      // Check if this is a pullback low (lower than recent candles and followed by recovery)
      let isLowerThanRecent = true;
      let hasRecovery = false;

      // Check previous candles
      for (let j = i - lookback; j < i; j++) {
        if (candles[j].data[2] <= currentLow) {
          isLowerThanRecent = false;
          break;
        }
      }

      // Check following candles for recovery
      for (let j = i + 1; j <= i + lookback && j < candles.length; j++) {
        if (candles[j].data[1] > currentClose || candles[j].data[2] > currentLow) {
          hasRecovery = true;
          break;
        }
      }

      if (isLowerThanRecent && hasRecovery) {
        isPullbackLow = true;
      }

      // Also include strict local lows as backup
      let isLocalLow = true;
      for (let j = Math.max(0, i - 1); j <= Math.min(candles.length - 1, i + 1); j++) {
        if (j !== i && candles[j].data[2] <= currentLow) {
          isLocalLow = false;
          break;
        }
      }

      if (isPullbackLow || isLocalLow) {
        lows.push({ index: i, price: currentLow });
      }
    }

    // If we still don't have enough lows, be more lenient and take swing lows
    if (lows.length < 2) {
      const swingLows = this.findSwingLows(candles);
      return swingLows;
    }

    return lows;
  }

  /**
   * Find swing lows - more lenient approach for ascending triangles
   */
  private findSwingLows(candles: any[]): Array<{ index: number; price: number }> {
    const lows = [];
    const period = 5; // Look at 5-candle periods

    for (let i = 0; i < candles.length - period; i += period) {
      const segment = candles.slice(i, i + period);
      let lowestIndex = 0;
      let lowestPrice = segment[0].data[2];

      // Find the lowest low in this segment
      for (let j = 1; j < segment.length; j++) {
        if (segment[j].data[2] < lowestPrice) {
          lowestPrice = segment[j].data[2];
          lowestIndex = j;
        }
      }

      lows.push({ index: i + lowestIndex, price: lowestPrice });
    }

    return lows;
  }

  /**
   * Find horizontal resistance level from highs
   */
  private findHorizontalResistance(highs: Array<{ index: number; price: number }>): number | null {
    if (highs.length < 2) {
      return null;
    }

    // Sort by price to find clusters
    const sortedHighs = [...highs].sort((a, b) => a.price - b.price);

    // Look for at least 2 highs within 2% of each other (horizontal resistance)
    for (let i = 0; i < sortedHighs.length - 1; i++) {
      const basePrice = sortedHighs[i].price;
      const clusteredHighs = [sortedHighs[i]];

      for (let j = i + 1; j < sortedHighs.length; j++) {
        const priceDiff = Math.abs(sortedHighs[j].price - basePrice) / basePrice;
        if (priceDiff <= 0.02) {
          // Within 2%
          clusteredHighs.push(sortedHighs[j]);
        }
      }

      if (clusteredHighs.length >= 2) {
        // Calculate average price of clustered highs as resistance level
        return clusteredHighs.reduce((sum, high) => sum + high.price, 0) / clusteredHighs.length;
      }
    }

    return null;
  }

  /**
   * Calculate support trend line from lows
   */
  private calculateSupportTrend(
    lows: Array<{ index: number; price: number }>
  ): { slope: number; intercept: number } | null {
    if (lows.length < 2) {
      return null;
    }

    // Sort by index (time order)
    const sortedLows = [...lows].sort((a, b) => a.index - b.index);

    // Use linear regression on the lows
    const n = sortedLows.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    for (const low of sortedLows) {
      sumX += low.index;
      sumY += low.price;
      sumXY += low.index * low.price;
      sumXX += low.index * low.index;
    }

    const denominator = n * sumXX - sumX * sumX;
    if (Math.abs(denominator) < 1e-10) {
      return null;
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Verify that the pattern shows convergence towards an apex
   */
  private verifyPatternConvergence(
    candles: any[],
    resistanceLevel: number,
    supportTrend: { slope: number; intercept: number }
  ): boolean {
    // Check if support line is approaching resistance level
    const startIndex = 0;
    const midIndex = Math.floor(candles.length / 2);
    const endIndex = candles.length - 1;

    const startSupportPrice = supportTrend.slope * startIndex + supportTrend.intercept;
    const midSupportPrice = supportTrend.slope * midIndex + supportTrend.intercept;
    const endSupportPrice = supportTrend.slope * endIndex + supportTrend.intercept;

    // Support should be rising
    if (endSupportPrice <= startSupportPrice) {
      return false;
    }

    // Check that the gap is narrowing over time (convergence)
    const startGap = resistanceLevel - startSupportPrice;
    const midGap = resistanceLevel - midSupportPrice;
    const endGap = resistanceLevel - endSupportPrice;

    // The pattern should show convergence - gaps should be getting smaller
    // But we allow for the final gap to be negative (breakout scenario)
    const isConverging = midGap < startGap && endGap < midGap;

    // Also ensure the support hasn't been too far below resistance at start
    const maxGapRatio = 0.15; // Support should start within 15% of resistance
    const startGapRatio = startGap / resistanceLevel;

    return isConverging && startGapRatio <= maxGapRatio;
  }

  /**
   * Check for breakout above resistance line
   */
  private checkBreakoutAboveResistance(candles: any[], resistanceLevel: number): boolean {
    // Check the last few candles for breakout
    const recentCandles = candles.slice(-3);

    // At least one candle should break above resistance (high > resistance)
    // and at least one should close above resistance for confirmation
    let hasHighBreakout = false;
    let hasCloseBreakout = false;

    for (const candle of recentCandles) {
      const high = candle.data[3];
      const close = candle.data[1];

      if (high > resistanceLevel) {
        hasHighBreakout = true;
      }

      if (close > resistanceLevel) {
        hasCloseBreakout = true;
      }
    }

    return hasHighBreakout && hasCloseBreakout;
  }
}
