import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { TimeFrame } from '@finance/utils/FinanceUtil';
import ErrorUtil from '@common/utils/ErrorUtil';

export const BullFlagConditionInfo: ConditionInfo = {
  name: 'ブルフラッグ',
  description: 'ブルフラッグ（Bull Flag）は、テクニカル分析における有名な継続パターンの一つで、上昇トレンドの中で一時的な調整を挟んだ後、再び上昇が続くと予想されるチャート形状です。フラッグポール（急騰部分）の後に、やや下向きまたは横ばいの小幅な調整（フラッグ部分）が続き、その後上方向にブレイクアウトすることで新たな買いシグナルとなります。一般的に、目標価格はフラッグポールの長さをブレイク地点に加算して算出されます。',
  isBuyCondition: true,
  isSellCondition: false,
  enableTargetPrice: false,
  enableTimeFrame: true,
  enableSimplifiedMode: true,
};

export default class BullFlagCondition extends ConditionBase {
  public async checkCondition(
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    timeframe?: TimeFrame | null
  ): Promise<boolean> {
    try {
      const stockData = await this.getStockPriceData(exchangeId, tickerId, { 
        count: 30, // Need enough data points to detect the flag pattern
        session,
        timeframe: timeframe || '1'
      });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 15) {
        return false;
      }

      // Get the most recent candles
      const candles = stockData.slice(-30);
      
      // Detect bull flag pattern
      return this.detectBullFlagPattern(candles);
    } catch (error) {
      ErrorUtil.throwError(`Error checking condition ${BullFlagConditionInfo.name}`, error);
    }
  }

  /**
   * Detect bull flag pattern
   * Key characteristics:
   * 1. Flagpole: Strong upward movement (at least 3-5% gain over 3-7 candles)
   * 2. Flag: Consolidation/slight pullback (2-4% retracement over 3-8 candles)
   * 3. Breakout: Price breaks above flag resistance with volume confirmation
   */
  private detectBullFlagPattern(candles: any[]): boolean {
    if (candles.length < 15) {
      return false;
    }

    // Find potential flagpole (strong upward movement)
    const flagpoleCandidates = this.findFlagpoleCandidates(candles);
    
    for (const flagpole of flagpoleCandidates) {
      // Look for flag formation after flagpole
      const flagStart = flagpole.endIndex;
      const flagCandidates = this.findFlagCandidates(candles, flagStart);
      
      for (const flag of flagCandidates) {
        // Check for recent breakout above flag resistance
        if (this.hasRecentBreakout(candles, flagpole, flag)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Find potential flagpole formations
   */
  private findFlagpoleCandidates(candles: any[]): Array<{startIndex: number, endIndex: number, startPrice: number, endPrice: number}> {
    const candidates: Array<{startIndex: number, endIndex: number, startPrice: number, endPrice: number}> = [];
    
    // Look for strong upward moves in the last 15 candles (leaving room for flag + breakout)
    for (let i = 0; i < candles.length - 8; i++) {
      for (let j = i + 3; j <= Math.min(i + 8, candles.length - 5); j++) {
        const startPrice = Math.min(candles[i].data[0], candles[i].data[1]); // min of open/close
        const endPrice = Math.max(candles[j].data[0], candles[j].data[1]); // max of open/close
        const gain = (endPrice - startPrice) / startPrice;
        
        // Flagpole should show at least 3% gain
        if (gain >= 0.03) {
          // Verify it's generally upward trending
          let upwardCount = 0;
          for (let k = i; k < j; k++) {
            if (candles[k + 1].data[1] > candles[k].data[1]) { // close[k+1] > close[k]
              upwardCount++;
            }
          }
          
          // At least 60% of moves should be upward
          if (upwardCount / (j - i) >= 0.6) {
            candidates.push({
              startIndex: i,
              endIndex: j,
              startPrice,
              endPrice
            });
          }
        }
      }
    }
    
    return candidates;
  }

  /**
   * Find potential flag formations after flagpole
   */
  private findFlagCandidates(candles: any[], flagStart: number): Array<{startIndex: number, endIndex: number, highPrice: number, lowPrice: number}> {
    const candidates: Array<{startIndex: number, endIndex: number, highPrice: number, lowPrice: number}> = [];
    
    // Flag should start within 1-2 candles after flagpole
    for (let start = flagStart; start <= Math.min(flagStart + 2, candles.length - 3); start++) {
      // Flag duration: 2-6 candles (adjusted for smaller datasets)
      for (let end = start + 2; end <= Math.min(start + 6, candles.length - 2); end++) {
        const flagCandles = candles.slice(start, end + 1);
        
        // Calculate flag high and low
        let highPrice = -Infinity;
        let lowPrice = Infinity;
        
        for (const candle of flagCandles) {
          highPrice = Math.max(highPrice, candle.data[3]); // high
          lowPrice = Math.min(lowPrice, candle.data[2]); // low
        }
        
        // Flag should be relatively tight consolidation (typically 0.5-5% range)
        const flagRange = (highPrice - lowPrice) / lowPrice;
        if (flagRange <= 0.05 && flagRange >= 0.005) {
          // Check if flag shows sideways/slight downward bias
          const firstClose = flagCandles[0].data[1];
          const lastClose = flagCandles[flagCandles.length - 1].data[1];
          const flagBias = (lastClose - firstClose) / firstClose;
          
          // Flag can be slightly down (-5%) to slightly up (+2%)
          if (flagBias >= -0.05 && flagBias <= 0.02) {
            candidates.push({
              startIndex: start,
              endIndex: end,
              highPrice,
              lowPrice
            });
          }
        }
      }
    }
    
    return candidates;
  }

  /**
   * Check for recent breakout above flag resistance
   */
  private hasRecentBreakout(candles: any[], flagpole: any, flag: any): boolean {
    // Look for breakout in the 1-3 candles after flag
    const breakoutStart = flag.endIndex + 1;
    const breakoutEnd = Math.min(breakoutStart + 3, candles.length);
    
    if (breakoutStart >= candles.length) {
      return false;
    }
    
    // Check if recent price action breaks above flag resistance
    for (let i = breakoutStart; i < breakoutEnd; i++) {
      const candle = candles[i];
      const candleHigh = candle.data[3]; // high
      const candleClose = candle.data[1]; // close
      
      // Breakout confirmed if:
      // 1. High breaks above flag resistance by at least 0.5%
      // 2. Close is also above flag resistance
      const breakoutThreshold = flag.highPrice * 1.005;
      
      if (candleHigh > breakoutThreshold && candleClose > flag.highPrice) {
        // Additional validation: ensure it's a meaningful breakout
        // Price should be at least approaching the flagpole high
        const progressTowardTarget = (candleClose - flag.lowPrice) / (flagpole.endPrice - flag.lowPrice);
        
        if (progressTowardTarget >= 0.2) { // At least 20% progress toward flagpole high (more lenient)
          return true;
        }
      }
    }
    
    return false;
  }
}