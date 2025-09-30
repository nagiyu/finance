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
   * Improved approach combining trend line analysis with practical checks:
   * 1. Both highs and lows should generally be rising
   * 2. Price range should be converging (narrowing wedge)
   * 3. Verify with trend lines that lower line is steeper or pattern is converging
   * 4. Check for recent breakdown below support
   */
  private detectRisingWedgePattern(candles: any[]): boolean {
    if (candles.length < 15) {
      return false;
    }

    // Analyze different sections of the data (similar to original but with improvements)
    const firstThird = candles.slice(0, Math.floor(candles.length / 3));
    const middleThird = candles.slice(Math.floor(candles.length / 3), Math.floor(candles.length * 2 / 3));
    const lastThirdFull = candles.slice(Math.floor(candles.length * 2 / 3));
    
    // Exclude last few candles from highs/lows (they might be breakdown candles)
    const lastThird = lastThirdFull.slice(0, -5);

    // Get high and low values for each section
    const firstHigh = Math.max(...firstThird.map(c => c.data[3]));
    const firstLow = Math.min(...firstThird.map(c => c.data[2]));
    
    const middleHigh = Math.max(...middleThird.map(c => c.data[3]));
    const middleLow = Math.min(...middleThird.map(c => c.data[2]));

    const lastHigh = Math.max(...lastThird.map(c => c.data[3]));
    const lastLow = Math.min(...lastThird.map(c => c.data[2]));

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

    // Pattern should show convergence (narrowing wedge) - be slightly more lenient
    const isConverging = lastSpread < firstSpread * 0.95 || lastSpread < middleSpread * 0.95;
    
    if (!isConverging) {
      return false;
    }

    // Additional verification using trend lines for more accuracy
    const significantHighs = this.findSwingHighs(candles);
    const significantLows = this.findSwingLows(candles);

    if (significantHighs.length >= 2 && significantLows.length >= 2) {
      const upperTrend = this.calculateTrendLine(significantHighs);
      const lowerTrend = this.calculateTrendLine(significantLows);

      // If we can calculate trend lines, verify the wedge characteristic
      if (upperTrend && lowerTrend) {
        // Both should be rising
        if (upperTrend.slope <= 0 || lowerTrend.slope <= 0) {
          return false;
        }

        // In a true rising wedge, lower line should be steeper or at least not significantly slower
        // Allow for parallel or near-parallel lines if spread is clearly narrowing
        const slopeRatio = lowerTrend.slope / upperTrend.slope;
        const spreadDecreaseRatio = lastSpread / firstSpread;
        
        // Either lower is steeper OR spread is significantly narrowing (compensates for parallel lines)
        if (slopeRatio < 0.90 && spreadDecreaseRatio > 0.70) {
          return false; // Lower slope is too shallow and not much convergence
        }
      }
    }

    // Check for breakdown in recent candles
    const recentCandles = lastThirdFull.slice(-6); // Last 6 candles
    const supportLevel = this.calculateSupportLevel(candles.slice(0, -5));

    if (supportLevel === null) {
      return false;
    }

    // Count breakdown candles
    let breakdownCount = 0;
    let significantBreakdownCount = 0;
    
    for (const candle of recentCandles) {
      const low = candle.data[2];
      const close = candle.data[1];
      
      if (low < supportLevel || close < supportLevel) {
        breakdownCount++;
        
        // Significant breakdown if close or low is notably below support (0.5% threshold)
        if (close < supportLevel * 0.995 || low < supportLevel * 0.99) {
          significantBreakdownCount++;
        }
      }
    }

    // Need at least 3 breakdown candles with at least 1 significant breakdown
    return breakdownCount >= 3 && significantBreakdownCount >= 1;
  }

  /**
   * Calculate support level from the pattern before breakdown
   */
  private calculateSupportLevel(candles: any[]): number | null {
    if (candles.length < 8) {
      return null;
    }

    // Find swing lows and calculate support trend line
    const swingLows = this.findSwingLows(candles);
    
    if (swingLows.length >= 2) {
      const lowerTrend = this.calculateTrendLine(swingLows);
      if (lowerTrend && lowerTrend.slope > 0) {
        // Project support line to the end of the pattern
        return lowerTrend.slope * (candles.length - 1) + lowerTrend.intercept;
      }
    }

    // Fallback: use average of recent lows (more recent = more weight)
    // For rising wedge, the support is higher near the end
    const recentCount = Math.min(10, candles.length);
    const recentLows = candles.slice(-recentCount).map(c => c.data[2]);
    recentLows.sort((a, b) => a - b);
    
    // Use average of lowest 50% (more lenient for rising pattern)
    const supportLows = recentLows.slice(0, Math.max(2, Math.ceil(recentLows.length * 0.5)));
    return supportLows.reduce((sum, low) => sum + low, 0) / supportLows.length;
  }

  /**
   * Find swing highs - peaks that are higher than nearby candles
   * More lenient than strict local maxima to work with rising wedge patterns
   */
  private findSwingHighs(candles: any[]): Array<{index: number, price: number}> {
    const highs: Array<{index: number, price: number}> = [];
    const lookback = 3; // Look 3 candles back and forward
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentHigh = candles[i].data[3]; // high price
      let isPeak = true;
      let higherThanSome = false;
      
      // Check if this is relatively high compared to surrounding candles
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i) {
          if (candles[j].data[3] > currentHigh) {
            isPeak = false;
            break;
          }
          if (candles[j].data[3] < currentHigh * 0.995) { // At least 0.5% higher
            higherThanSome = true;
          }
        }
      }
      
      if (isPeak && higherThanSome) {
        highs.push({ index: i, price: currentHigh });
      }
    }
    
    // If we don't have enough swing highs, include section-based highs
    if (highs.length < 2) {
      const sectionSize = Math.floor(candles.length / 4);
      for (let section = 0; section < 4; section++) {
        const start = section * sectionSize;
        const end = section === 3 ? candles.length : (section + 1) * sectionSize;
        const sectionCandles = candles.slice(start, end);
        
        if (sectionCandles.length > 0) {
          let maxHigh = -Infinity;
          let maxIndex = -1;
          
          for (let i = 0; i < sectionCandles.length; i++) {
            if (sectionCandles[i].data[3] > maxHigh) {
              maxHigh = sectionCandles[i].data[3];
              maxIndex = start + i;
            }
          }
          
          if (maxIndex >= 0 && !highs.some(h => h.index === maxIndex)) {
            highs.push({ index: maxIndex, price: maxHigh });
          }
        }
      }
    }
    
    return highs.sort((a, b) => a.index - b.index);
  }

  /**
   * Find swing lows - troughs that are lower than nearby candles
   * More lenient than strict local minima to work with rising wedge patterns
   */
  private findSwingLows(candles: any[]): Array<{index: number, price: number}> {
    const lows: Array<{index: number, price: number}> = [];
    const lookback = 3; // Look 3 candles back and forward
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentLow = candles[i].data[2]; // low price
      let isTrough = true;
      let lowerThanSome = false;
      
      // Check if this is relatively low compared to surrounding candles
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i) {
          if (candles[j].data[2] < currentLow) {
            isTrough = false;
            break;
          }
          if (candles[j].data[2] > currentLow * 1.005) { // At least 0.5% lower
            lowerThanSome = true;
          }
        }
      }
      
      if (isTrough && lowerThanSome) {
        lows.push({ index: i, price: currentLow });
      }
    }
    
    // If we don't have enough swing lows, include section-based lows
    if (lows.length < 2) {
      const sectionSize = Math.floor(candles.length / 4);
      for (let section = 0; section < 4; section++) {
        const start = section * sectionSize;
        const end = section === 3 ? candles.length : (section + 1) * sectionSize;
        const sectionCandles = candles.slice(start, end);
        
        if (sectionCandles.length > 0) {
          let minLow = Infinity;
          let minIndex = -1;
          
          for (let i = 0; i < sectionCandles.length; i++) {
            if (sectionCandles[i].data[2] < minLow) {
              minLow = sectionCandles[i].data[2];
              minIndex = start + i;
            }
          }
          
          if (minIndex >= 0 && !lows.some(l => l.index === minIndex)) {
            lows.push({ index: minIndex, price: minLow });
          }
        }
      }
    }
    
    return lows.sort((a, b) => a.index - b.index);
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

    const denominator = n * sumXX - sumX * sumX;
    if (Math.abs(denominator) < 1e-10) {
      return null;
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }
}