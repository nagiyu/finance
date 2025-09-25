import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const RisingDoubleBottomConditionInfo: ConditionInfo = {
  name: '切り上げダブルボトム',
  description: '切り上げダブルボトムは、下降トレンドの底値圏で出現する反転型のテクニカルパターンです。通常のダブルボトムとは異なり、2回目の安値が1回目よりも高い位置にあることが特徴で、下降トレンドの勢いが弱まり、買い圧力が強まっていることを示唆します。2つの底の間にできる戻り高値（ネックライン）を上抜けることで上昇トレンドへの転換シグナルとされます。',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
};

export default class RisingDoubleBottomCondition extends ConditionBase {
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
      
      // Detect rising double bottom pattern
      return this.detectRisingDoubleBottomPattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${RisingDoubleBottomConditionInfo.name}`, error);
    }
  }

  /**
   * Detect rising double bottom pattern
   * Look for two bottoms where the second bottom is higher than the first,
   * with a peak between them, and confirmation when price breaks above the neckline
   */
  private detectRisingDoubleBottomPattern(candles: any[]): boolean {
    // Find valleys (where low is lower than neighbors)
    const valleys = [];
    for (let i = 1; i < candles.length - 1; i++) {
      const prevLow = candles[i - 1].data[2]; // low price
      const currentLow = candles[i].data[2];
      const nextLow = candles[i + 1].data[2];
      
      if (currentLow < prevLow && currentLow < nextLow) {
        valleys.push({ index: i, price: currentLow });
      }
    }

    if (valleys.length < 2) {
      return false;
    }

    // Check each pair of valleys for rising double bottom pattern
    for (let i = 0; i < valleys.length - 1; i++) {
      const firstBottom = valleys[i];
      const secondBottom = valleys[i + 1];

      // The second bottom should be higher than the first (rising characteristic)
      if (secondBottom.price <= firstBottom.price) {
        continue;
      }

      // The difference should not be too large (within reasonable bounds)
      // Second bottom should be 0.5% to 10% higher than first bottom
      const heightDiff = (secondBottom.price - firstBottom.price) / firstBottom.price;
      if (heightDiff < 0.005 || heightDiff > 0.10) {
        continue;
      }

      // Find the peak (highest point) between the two bottoms
      const peak = this.findHighestBetween(candles, firstBottom.index, secondBottom.index);
      
      if (peak === null) {
        continue;
      }

      // The peak should be significantly higher than both bottoms (at least 3% higher)
      const peakHeight = Math.min(
        (peak - firstBottom.price) / firstBottom.price,
        (peak - secondBottom.price) / secondBottom.price
      );
      
      if (peakHeight < 0.03) {
        continue;
      }

      // Check if current price has broken above the neckline (peak level)
      const currentClose = candles[candles.length - 1].data[1]; // close price
      const neckline = peak;
      
      if (currentClose > neckline) {
        // Additional confirmation: ensure the breakout is not just a brief spike
        // Check if at least one more recent candle also closed above neckline
        let confirmationCount = 0;
        for (let j = Math.max(0, candles.length - 3); j < candles.length; j++) {
          if (candles[j].data[1] > neckline) { // close price
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
   * Find the highest high price between two indices
   */
  private findHighestBetween(candles: any[], startIndex: number, endIndex: number): number | null {
    if (startIndex >= endIndex) {
      return null;
    }

    let highest = Number.MIN_VALUE;
    
    for (let i = startIndex + 1; i < endIndex; i++) {
      const high = candles[i].data[3]; // high price
      if (high > highest) {
        highest = high;
      }
    }

    return highest === Number.MIN_VALUE ? null : highest;
  }
}