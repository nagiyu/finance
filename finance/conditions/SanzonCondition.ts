import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const SanzonConditionInfo: ConditionInfo = {
  name: '三尊',
  description:
    '三尊（Head and Shoulders）は、上昇トレンドの終盤に現れやすい弱気の反転パターンです。3つの山（ピーク）を形成し、中央の山（頭）が最も高く、両側の山（肩）は類似の高さで頭より低くなります。山と山の間の安値（谷）を結んだネックラインを明確に下抜けることで下落トレンド入りのシグナルとされます。厳格な検証により、谷の深さ（2%以上）、肩の対称性、ネックライン突破の確認を行います。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class SanzonCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, {
        count: 15, // Simpler pattern with fewer data points
        session,
        timeframe: timeframe || '1',
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-15);

      // Simple approach: find 3 distinct peaks and check the pattern
      return this.detectSimpleHeadAndShouldersPattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${SanzonConditionInfo.name}`, error);
    }
  }

  /**
   * Head and shoulders pattern detection
   * Look for 3 clear peaks where middle one is highest, with proper validation
   */
  private detectSimpleHeadAndShouldersPattern(candles: any[]): boolean {
    // Find peaks (where high is greater than neighbors)
    const peaks = [];
    for (let i = 1; i < candles.length - 1; i++) {
      const prevHigh = candles[i - 1].data[3];
      const currentHigh = candles[i].data[3];
      const nextHigh = candles[i + 1].data[3];

      if (currentHigh > prevHigh && currentHigh > nextHigh) {
        peaks.push({ index: i, price: currentHigh });
      }
    }

    if (peaks.length < 3) {
      return false;
    }

    // Check each combination of 3 consecutive peaks
    for (let i = 0; i <= peaks.length - 3; i++) {
      const left = peaks[i];
      const head = peaks[i + 1];
      const right = peaks[i + 2];

      // Head must be highest
      if (head.price > left.price && head.price > right.price) {
        // Shoulders should be similar (within 15% for more strict validation)
        const shoulderDiff = Math.abs(left.price - right.price) / Math.max(left.price, right.price);
        if (shoulderDiff <= 0.15) {
          // Find valleys between peaks for neckline calculation
          const valley1 = this.findLowestBetween(candles, left.index, head.index);
          const valley2 = this.findLowestBetween(candles, head.index, right.index);

          if (valley1 !== null && valley2 !== null) {
            // Valleys should be significantly lower than peaks (at least 2% lower for realistic market conditions)
            const valley1Depth = Math.min(
              (left.price - valley1) / left.price,
              (head.price - valley1) / head.price
            );
            const valley2Depth = Math.min(
              (head.price - valley2) / head.price,
              (right.price - valley2) / right.price
            );

            if (valley1Depth < 0.02 || valley2Depth < 0.02) {
              continue;
            }

            // Valleys should be relatively similar (within 5% difference)
            const valleyDiff = Math.abs(valley1 - valley2) / Math.max(valley1, valley2);
            if (valleyDiff > 0.05) {
              continue;
            }

            const neckline = (valley1 + valley2) / 2;
            const currentClose = candles[candles.length - 1].data[1];

            // Pattern confirmed if current price is below neckline
            if (currentClose < neckline) {
              // Additional confirmation: ensure the breakdown is not just a brief dip
              // Check if at least 2 of the last 3 candles closed below neckline
              let confirmationCount = 0;
              for (let j = Math.max(0, candles.length - 3); j < candles.length; j++) {
                if (candles[j].data[1] < neckline) {
                  // close price
                  confirmationCount++;
                }
              }

              if (confirmationCount >= 2) {
                return true;
              }
            }
          }
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
