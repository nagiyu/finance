import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const SanzonConditionInfo: ConditionInfo = {
  name: '三尊',
  description: '三尊（Head and Shoulders）は、上昇トレンドの終盤に現れやすい弱気の反転パターンです。3つの山（ピーク）を形成し、中央の山（頭）が最も高く、両側の山（肩）はやや低く揃う形になります。山と山の間の安値を結んだネックラインを下抜けると下落トレンド入りのシグナルとされます。',
  isBuyCondition: false,
  isSellCondition: true,
  enableTargetPrice: false,
  enableTimeFrame: true,
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
        count: 20, // Need more data points to identify the pattern
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-20);
      
      // Simplified approach: look for the pattern in the data
      const result = this.detectHeadAndShouldersPattern(candles);
      console.log('Pattern detection result:', result);
      return result;
    } catch (error) {
      console.error('Error in SanzonCondition:', error);
      ErrorUtil.throwError(`Error checking condition ${SanzonConditionInfo.name}`, error);
    }
  }

  /**
   * Simplified head and shoulders pattern detection
   */
  private detectHeadAndShouldersPattern(candles: any[]): boolean {
    // Find significant highs (peaks) in the data
    const peaks: { index: number; price: number }[] = [];
    
    for (let i = 1; i < candles.length - 1; i++) {
      const prev = candles[i - 1];
      const current = candles[i];
      const next = candles[i + 1];
      
      const prevHigh = prev.data[3];
      const currentHigh = current.data[3];
      const nextHigh = next.data[3];
      
      // Simple peak detection
      if (currentHigh > prevHigh && currentHigh > nextHigh) {
        peaks.push({ index: i, price: currentHigh });
      }
    }

    console.log('Peaks found:', peaks);

    if (peaks.length < 3) {
      console.log('Not enough peaks:', peaks.length);
      return false;
    }

    // Look for the pattern in recent peaks
    for (let i = 0; i <= peaks.length - 3; i++) {
      const leftShoulder = peaks[i];
      const head = peaks[i + 1];
      const rightShoulder = peaks[i + 2];

      console.log('Testing pattern:', { leftShoulder, head, rightShoulder });

      // Head should be higher than both shoulders
      if (head.price <= leftShoulder.price || head.price <= rightShoulder.price) {
        console.log('Head not highest');
        continue;
      }

      // Shoulders should be roughly similar (within 15% difference)
      const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / Math.max(leftShoulder.price, rightShoulder.price);
      if (shoulderDiff > 0.15) {
        console.log('Shoulders too different:', shoulderDiff);
        continue;
      }

      // Find valleys between peaks for neckline
      const valley1 = this.findLowestBetween(candles, leftShoulder.index, head.index);
      const valley2 = this.findLowestBetween(candles, head.index, rightShoulder.index);

      console.log('Valleys:', { valley1, valley2 });

      if (valley1 === null || valley2 === null) {
        console.log('No valleys found');
        continue;
      }

      // Calculate neckline
      const neckline = (valley1.price + valley2.price) / 2;

      // Check if we've broken below the neckline
      const currentPrice = candles[candles.length - 1].data[1]; // closing price
      
      console.log('Neckline:', neckline, 'Current price:', currentPrice, 'Threshold:', neckline * 0.98);
      
      if (currentPrice < neckline * 0.98) { // 2% buffer below neckline
        console.log('Pattern detected!');
        return true;
      }
    }

    console.log('No pattern found');
    return false;
  }

  /**
   * Find the lowest point between two indices
   */
  private findLowestBetween(candles: any[], startIndex: number, endIndex: number): { price: number; index: number } | null {
    if (startIndex >= endIndex) {
      return null;
    }

    let lowest = { price: Number.MAX_VALUE, index: -1 };
    
    for (let i = startIndex + 1; i < endIndex; i++) {
      const low = candles[i].data[2]; // low price
      if (low < lowest.price) {
        lowest = { price: low, index: i };
      }
    }

    return lowest.index === -1 ? null : lowest;
  }
}