import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const DoubleTopConditionInfo: ConditionInfo = {
  name: 'ダブルトップ',
  description: 'ダブルトップは、株価チャートに現れる代表的な天井圏のチャートパターンで、トレンド転換のシグナルとしてよく使われます。上昇トレンドの終盤で株価がほぼ同じ水準で2回高値をつけることで形成され、2つの山の間にできる安値ライン（ネックライン）を下抜けると下落トレンドへの転換シグナルとされます。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class DoubleTopCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { 
        count: 20, // Need enough data points to detect the pattern
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 10) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-20);
      
      // Detect double top pattern
      return this.detectDoubleTopPattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${DoubleTopConditionInfo.name}`, error);
    }
  }

  /**
   * Detect double top pattern
   * Look for two peaks at similar levels with a valley between them,
   * and confirmation when price breaks below the neckline
   */
  private detectDoubleTopPattern(candles: any[]): boolean {
    // Find peaks (where high is greater than neighbors)
    const peaks = [];
    for (let i = 1; i < candles.length - 1; i++) {
      const prevHigh = candles[i - 1].data[3]; // high price
      const currentHigh = candles[i].data[3];
      const nextHigh = candles[i + 1].data[3];
      
      if (currentHigh > prevHigh && currentHigh > nextHigh) {
        peaks.push({ index: i, price: currentHigh });
      }
    }

    if (peaks.length < 2) {
      return false;
    }

    // Check each pair of peaks for double top pattern
    for (let i = 0; i < peaks.length - 1; i++) {
      const firstPeak = peaks[i];
      const secondPeak = peaks[i + 1];

      // Peaks should be similar in height (within 5% tolerance)
      const heightDiff = Math.abs(firstPeak.price - secondPeak.price) / Math.max(firstPeak.price, secondPeak.price);
      if (heightDiff > 0.05) {
        continue;
      }

      // Find the valley (lowest point) between the two peaks
      const valley = this.findLowestBetween(candles, firstPeak.index, secondPeak.index);
      
      if (valley === null) {
        continue;
      }

      // The valley should be significantly lower than the peaks (at least 3% lower)
      const valleyDepth = Math.min(
        (firstPeak.price - valley) / firstPeak.price,
        (secondPeak.price - valley) / secondPeak.price
      );
      
      if (valleyDepth < 0.03) {
        continue;
      }

      // Check if current price has broken below the neckline (valley level)
      const currentClose = candles[candles.length - 1].data[1]; // close price
      const neckline = valley;
      
      if (currentClose < neckline) {
        // Additional confirmation: ensure the breakdown is not just a brief dip
        // Check if at least one more recent candle also closed below neckline
        let confirmationCount = 0;
        for (let j = Math.max(0, candles.length - 3); j < candles.length; j++) {
          if (candles[j].data[1] < neckline) { // close price
            confirmationCount++;
          }
        }
        
        if (confirmationCount >= 2) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Find the lowest low price between two indices
   */
  private findLowestBetween(candles: any[], startIndex: number, endIndex: number): number | null {
    if (startIndex >= endIndex) {
      return null;
    }

    let lowest = Number.MAX_VALUE;
    
    for (let i = startIndex + 1; i < endIndex; i++) {
      const low = candles[i].data[2]; // low price
      if (low < lowest) {
        lowest = low;
      }
    }

    return lowest === Number.MAX_VALUE ? null : lowest;
  }
}