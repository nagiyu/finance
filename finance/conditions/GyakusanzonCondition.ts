import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const GyakusanzonConditionInfo: ConditionInfo = {
  name: '逆三尊',
  description: '逆三尊（Inverse Head and Shoulders）は、下落トレンドの終盤に現れやすい強気の反転パターンです。3つの谷（底）を形成し、中央の谷（頭）が最も深く、両側の谷（肩）は類似の深さで頭より浅くなります。谷と谷の間の高値（山）を結んだネックラインを明確に上抜けることで上昇トレンド入りのシグナルとされます。厳格な検証により、山の高さ（2%以上の反発）、肩の対称性、ネックライン突破の確認を行います。',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
};

export default class GyakusanzonCondition extends ConditionBase {
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
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-15);
      
      // Simple approach: find 3 distinct valleys and check the pattern
      return this.detectSimpleInverseHeadAndShouldersPattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${GyakusanzonConditionInfo.name}`, error);
    }
  }

  /**
   * Inverse Head and shoulders pattern detection
   * Look for 3 clear valleys where middle one is lowest, with proper validation
   */
  private detectSimpleInverseHeadAndShouldersPattern(candles: any[]): boolean {
    // Find valleys (where low is lower than neighbors)
    const valleys = [];
    for (let i = 1; i < candles.length - 1; i++) {
      const prevLow = candles[i - 1].data[2];
      const currentLow = candles[i].data[2];
      const nextLow = candles[i + 1].data[2];
      
      if (currentLow < prevLow && currentLow < nextLow) {
        valleys.push({ index: i, price: currentLow });
      }
    }

    if (valleys.length < 3) {
      return false;
    }

    // Check each combination of 3 consecutive valleys
    for (let i = 0; i <= valleys.length - 3; i++) {
      const left = valleys[i];
      const head = valleys[i + 1];
      const right = valleys[i + 2];

      // Head must be lowest
      if (head.price < left.price && head.price < right.price) {
        // Shoulders should be similar (within 15% for more strict validation)
        const shoulderDiff = Math.abs(left.price - right.price) / Math.max(left.price, right.price);
        if (shoulderDiff <= 0.15) {
          // Find peaks between valleys for neckline calculation
          const peak1 = this.findHighestBetween(candles, left.index, head.index);
          const peak2 = this.findHighestBetween(candles, head.index, right.index);
          
          if (peak1 !== null && peak2 !== null) {
            // Peaks should be significantly higher than valleys (at least 2% higher for realistic market conditions)
            const peak1Height = Math.min(
              (peak1 - left.price) / left.price,
              (peak1 - head.price) / head.price
            );
            const peak2Height = Math.min(
              (peak2 - head.price) / head.price,
              (peak2 - right.price) / right.price
            );
            
            if (peak1Height < 0.02 || peak2Height < 0.02) {
              continue;
            }

            // Peaks should be relatively similar (within 5% difference)
            const peakDiff = Math.abs(peak1 - peak2) / Math.max(peak1, peak2);
            if (peakDiff > 0.05) {
              continue;
            }

            const neckline = (peak1 + peak2) / 2;
            const currentClose = candles[candles.length - 1].data[1];
            
            // Pattern confirmed if current price is above neckline
            if (currentClose > neckline) {
              // Additional confirmation: ensure the breakout is not just a brief spike
              // Check if at least 2 of the last 3 candles closed above neckline
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