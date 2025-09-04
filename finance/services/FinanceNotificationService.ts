import CRUDServiceBase from '@common/services/CRUDServiceBase';
import DateUtil from '@common/utils/DateUtil';
import ErrorUtil from '@common/utils/ErrorUtil';
import NotificationUtil from '@common/utils/NotificationUtil';
import TimeUtil from '@common/utils/TimeUtil';
import { SubscriptionType } from '@common/interfaces/SubscriptionType';
import { TimeType } from '@common/interfaces/TimeType';

import ExchangeService from '@finance/services/ExchangeService';
import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import FinanceUtil from '@finance/utils/FinanceUtil';
import TickerService from '@finance/services/TickerService';
import { FinanceNotificationConditionType, FINANCE_NOTIFICATION_CONDITION_TYPE, DAILY_CONDITION_TYPES, MINUTE_LEVEL_CONDITION_TYPES, FINANCE_NOTIFICATION_FREQUENCY } from '@finance/types/FinanceNotificationType';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';
import { FINANCE_RECORD_DATA_TYPE } from '@finance/types/FinanceRecordDataType';
import { ExchangeDataType } from '@finance/interfaces/data/ExchangeDataType';

interface Condition {
  met: boolean;
  message: string;
}

export default class FinanceNotificationService extends CRUDServiceBase<FinanceNotificationDataType, FinanceNotificationRecordType> {
  public constructor() {
    super(new FinanceNotificationDataAccessor(), FinanceNotificationService.dataToRecord, FinanceNotificationService.recordToData);
  }

  public async notification(endpoint: string): Promise<void> {
    const notifications = await this.get();

    const errors: string[] = [];

    for (const notification of notifications) {
      try {
        console.log(`Looking up exchange and ticker data for notification ${notification.id}`);

        const exchange = await this.getExchange(notification.exchangeId);
        const exchangeKey = exchange.key;
        const tickerKey = await this.getTickerKey(notification.tickerId);

        console.log(`Checking condition for ${exchangeKey}:${tickerKey}`);

        // Determine condition types for timing validation
        let conditionTypes: FinanceNotificationConditionType[] = [];
        
        if (notification.mode && notification.conditions) {
          try {
            conditionTypes = JSON.parse(notification.conditions) as FinanceNotificationConditionType[];
          } catch (error) {
            console.error('Error parsing conditions JSON:', error);
            conditionTypes = [notification.conditionType];
          }
        } else {
          conditionTypes = [notification.conditionType];
        }

        // Check timing constraints before checking conditions
        if (!this.shouldSendNotification(notification, exchange, conditionTypes)) {
          continue;
        }

        // Check if condition is met - handle both legacy and new formats
        let conditionMet = false;
        let conditionMessage = '';

        if (notification.mode && notification.conditions) {
          // New multi-condition format
          try {
            const conditions: string[] = JSON.parse(notification.conditions);
            for (const conditionType of conditions) {
              const condition = await this.checkCondition(conditionType as FinanceNotificationConditionType, `${exchangeKey}:${tickerKey}`, exchangeKey, tickerKey, notification.conditionValue);
              if (condition.met) {
                conditionMet = true;
                conditionMessage = condition.message;
                break; // If any condition is met, trigger notification
              }
            }
          } catch (error) {
            console.error('Error parsing conditions JSON:', error);
            // Fall back to legacy format
            const condition = await this.checkCondition(notification.conditionType, `${exchangeKey}:${tickerKey}`, exchangeKey, tickerKey, notification.conditionValue);
            conditionMet = condition.met;
            conditionMessage = condition.message;
          }
        } else {
          // Legacy single condition format
          const condition = await this.checkCondition(notification.conditionType, `${exchangeKey}:${tickerKey}`, exchangeKey, tickerKey, notification.conditionValue);
          conditionMet = condition.met;
          conditionMessage = condition.message;
        }

        if (!conditionMet) {
          continue;
        }

        console.log(`Condition met for notification ${notification.id}, sending push notification`);

        // Prepare subscription object
        const subscription: SubscriptionType = {
          endpoint: notification.subscriptionEndpoint,
          keys: {
            p256dh: notification.subscriptionKeysP256dh,
            auth: notification.subscriptionKeysAuth
          }
        };

        await NotificationUtil.sendPushNotification(endpoint, conditionMessage, subscription);

        // Update first notification flag if this is the first notification for pattern conditions
        if (!notification.firstNotificationSent) {
          const hasDailyCondition = conditionTypes.some(type => this.isDailyCondition(type));
          const isMinuteLevel = (notification.frequency || FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL) === FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL;
          
          if (hasDailyCondition && isMinuteLevel) {
            console.log(`Marking first notification as sent for ${notification.id}`);
            await this.update({
              ...notification,
              firstNotificationSent: true
            });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Error processing notification ${notification.id}: ${error.message}`);
        } else {
          errors.push(`Unknown error processing notification ${notification.id}`);
        }
      }
    }

    if (errors.length > 0) {
      ErrorUtil.throwError(errors.join('; '));
    }
  }

  private static dataToRecord(data: FinanceNotificationDataType): FinanceNotificationRecordType {
    return {
      ID: data.id,
      DataType: FINANCE_RECORD_DATA_TYPE.FINANCE_NOTIFICATION,
      TerminalID: data.terminalId,
      SubscriptionEndpoint: data.subscriptionEndpoint,
      SubscriptionKeysP256dh: data.subscriptionKeysP256dh,
      SubscriptionKeysAuth: data.subscriptionKeysAuth,
      ExchangeID: data.exchangeId,
      TickerID: data.tickerId,
      ConditionType: data.conditionType,
      ConditionValue: data.conditionValue,
      Mode: data.mode,
      Conditions: data.conditions,
      TimeFrame: data.timeFrame,
      Frequency: data.frequency,
      FirstNotificationSent: data.firstNotificationSent,
      Create: data.create,
      Update: data.update,
    };
  }

  private static recordToData(record: FinanceNotificationRecordType): FinanceNotificationDataType {
    return {
      id: record.ID,
      terminalId: record.TerminalID,
      subscriptionEndpoint: record.SubscriptionEndpoint,
      subscriptionKeysP256dh: record.SubscriptionKeysP256dh,
      subscriptionKeysAuth: record.SubscriptionKeysAuth,
      exchangeId: record.ExchangeID,
      tickerId: record.TickerID,
      conditionType: record.ConditionType,
      conditionValue: record.ConditionValue,
      mode: record.Mode,
      conditions: record.Conditions,
      timeFrame: record.TimeFrame,
      frequency: record.Frequency,
      firstNotificationSent: record.FirstNotificationSent,
      create: record.Create,
      update: record.Update,
    };
  }

  private async getExchangeKey(exchangeId: string): Promise<string> {
    const service = new ExchangeService();
    const exchanges = await service.get();
    const exchange = exchanges.find(e => e.id === exchangeId);

    if (!exchange) {
      ErrorUtil.throwError(`Exchange not found for ID: ${exchangeId}`);
    }

    return exchange.key;
  }

  private async getExchange(exchangeId: string): Promise<ExchangeDataType> {
    const service = new ExchangeService();
    const exchanges = await service.get();
    const exchange = exchanges.find(e => e.id === exchangeId);

    if (!exchange) {
      ErrorUtil.throwError(`Exchange not found for ID: ${exchangeId}`);
    }

    return exchange;
  }

  private async getTickerKey(tickerId: string): Promise<string> {
    const service = new TickerService();
    const tickers = await service.get();
    const ticker = tickers.find(t => t.id === tickerId);

    if (!ticker) {
      ErrorUtil.throwError(`Ticker not found for ID: ${tickerId}`);
    }

    return ticker.key;
  }

  /**
   * Check if current time is within exchange operating hours
   */
  private isWithinExchangeHours(exchange: ExchangeDataType, currentTime: Date = DateUtil.getNowJSTAsDate()): boolean {
    const currentJSTTime = TimeUtil.getJSTTime(currentTime);
    const currentTotalMinutes = currentJSTTime.hour * 60 + currentJSTTime.minute;
    
    const startTotalMinutes = exchange.start.hour * 60 + exchange.start.minute;
    const endTotalMinutes = exchange.end.hour * 60 + exchange.end.minute;
    
    // Check if exchange operates across midnight (e.g., 23:00 to 01:00)
    if (startTotalMinutes > endTotalMinutes) {
      // Exchange crosses midnight - check both ranges
      return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
    } else {
      // Normal case - start time is before end time
      return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
    }
  }

  /**
   * Check if current time is the start of exchange hours (for daily notifications)
   */
  private isExchangeStartTime(exchange: ExchangeDataType, currentTime: Date = DateUtil.getNowJSTAsDate()): boolean {
    const currentJSTTime = TimeUtil.getJSTTime(currentTime);
    
    return currentJSTTime.hour === exchange.start.hour && currentJSTTime.minute === exchange.start.minute;
  }

  /**
   * Determine if condition type is daily-based or minute-level
   */
  private isDailyCondition(conditionType: FinanceNotificationConditionType): boolean {
    return DAILY_CONDITION_TYPES.includes(conditionType as any);
  }

  /**
   * Check if notification should be sent based on timing rules
   */
  private shouldSendNotification(
    notification: FinanceNotificationDataType, 
    exchange: ExchangeDataType, 
    conditionTypes: FinanceNotificationConditionType[]
  ): boolean {
    const currentTime = DateUtil.getNowJSTAsDate();
    
    // First check if we're within exchange hours
    if (!this.isWithinExchangeHours(exchange, currentTime)) {
      console.log(`Notification ${notification.id} skipped - outside exchange hours`);
      return false;
    }

    // Check frequency preference
    const frequency = notification.frequency || FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL;
    const hasDailyCondition = conditionTypes.some(type => this.isDailyCondition(type));
    
    switch (frequency) {
      case FINANCE_NOTIFICATION_FREQUENCY.EXCHANGE_START_ONLY:
        // Only send at exchange start
        if (!this.isExchangeStartTime(exchange, currentTime)) {
          console.log(`Notification ${notification.id} skipped - not exchange start time`);
          return false;
        }
        break;
        
      case FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL:
        // Every minute for price conditions, special logic for pattern conditions
        if (hasDailyCondition) {
          // Pattern conditions: first time OR exchange start time
          if (!notification.firstNotificationSent) {
            // First notification - allow during exchange hours
            console.log(`Notification ${notification.id} - first notification for pattern condition`);
            break;
          } else if (!this.isExchangeStartTime(exchange, currentTime)) {
            // Subsequent notifications only at exchange start
            console.log(`Notification ${notification.id} skipped - pattern condition outside start time`);
            return false;
          }
        }
        // Price conditions: always allow during exchange hours (no additional restrictions)
        break;
        
      case FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL:
        // Every 10 minutes (only at first batch processing of each 10-minute window)
        if (!this.isTenMinuteInterval(currentTime)) {
          console.log(`Notification ${notification.id} skipped - not at 10-minute interval`);
          return false;
        }
        break;
        
      case FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL:
        // Every hour (only when minute is 0)
        if (!this.isHourlyInterval(currentTime)) {
          console.log(`Notification ${notification.id} skipped - not at hourly interval`);
          return false;
        }
        break;
        
      default:
        console.log(`Notification ${notification.id} - unknown frequency: ${frequency}`);
        return false;
    }
    
    return true;
  }

  /**
   * Check if current time is at a 10-minute interval (0, 10, 20, 30, 40, 50 minutes)
   */
  private isTenMinuteInterval(currentTime: Date): boolean {
    const minutes = currentTime.getMinutes();
    return minutes % 10 === 0;
  }

  /**
   * Check if current time is at an hourly interval (minute is 0)
   */
  private isHourlyInterval(currentTime: Date): boolean {
    const minutes = currentTime.getMinutes();
    return minutes === 0;
  }

  private async checkCondition(conditionType: FinanceNotificationConditionType, target: string, exchangeKey: string, tickerKey: string, conditionValue: number): Promise<Condition> {
    switch (conditionType) {
      case FINANCE_NOTIFICATION_CONDITION_TYPE.GREATER_THAN:
      case FINANCE_NOTIFICATION_CONDITION_TYPE.LESS_THAN:
        return await this.checkPriceCondition(conditionType, target, exchangeKey, tickerKey, conditionValue);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_RED_SOLDIERS:
        return await this.checkThreeRedSoldiers(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_RIVER_EVENING_STAR:
        return await this.checkThreeRiverEveningStar(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.TWO_TAKURI_LINES:
        return await this.checkTwoTakuriLines(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.SWALLOW_RETURN:
        return await this.checkSwallowReturn(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.FIREWORKS:
        return await this.checkFireworks(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.OKAJI_THREE_CROWS:
        return await this.checkOkajiThreeCrows(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.FALLING_STONES:
        return await this.checkFallingStones(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.BULLISH_HARAMI_CROSS:
        return await this.checkBullishHaramiCross(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.HAWK_REVERSAL:
        return await this.checkHawkReversal(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.THREE_DARK_STARS:
        return await this.checkThreeDarkStars(target, exchangeKey, tickerKey);

      case FINANCE_NOTIFICATION_CONDITION_TYPE.SHOOTING_STAR:
        return await this.checkShootingStar(target, exchangeKey, tickerKey);

      default:
        ErrorUtil.throwError(`Unknown condition type: ${conditionType}`);
    }

    return { met: false, message: '' };
  }

  private async checkPriceCondition(conditionType: FinanceNotificationConditionType, target: string, exchangeKey: string, tickerKey: string, conditionValue: number): Promise<Condition> {
    const currentPrice = await FinanceUtil.getCurrentStockPrice(exchangeKey, tickerKey);

    if (currentPrice === null) {
      return { met: false, message: `No stock data available for ${target}` };
    }

    console.log(`Current price for ${target}: ${currentPrice}, condition: ${conditionType} ${conditionValue}`);

    switch (conditionType) {
      case FINANCE_NOTIFICATION_CONDITION_TYPE.GREATER_THAN:
        if (this.checkGreaterThan(currentPrice, conditionValue)) {
          return { met: true, message: `${target} price ${currentPrice} is above your target of ${conditionValue}` };
        }
        break;

      case FINANCE_NOTIFICATION_CONDITION_TYPE.LESS_THAN:
        if (this.checkLessThan(currentPrice, conditionValue)) {
          return { met: true, message: `${target} price ${currentPrice} is below your target of ${conditionValue}` };
        }
        break;
    }

    return { met: false, message: '' };
  }

  private async checkThreeRedSoldiers(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);
      
      // Check if all 3 candles are bullish (close > open)
      const allBullish = candles.every(candle => candle.data[1] > candle.data[0]); // close > open

      if (!allBullish) {
        return { met: false, message: '' };
      }

      // Check if 2nd and 3rd candles start within the range of the previous candle
      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      const firstLow = firstCandle.data[2];
      const firstHigh = firstCandle.data[3];
      const secondOpen = secondCandle.data[0];
      const secondLow = secondCandle.data[2];
      const secondHigh = secondCandle.data[3];
      const thirdOpen = thirdCandle.data[0];

      // Second candle should start within first candle's range
      const secondStartsInRange = secondOpen >= firstLow && secondOpen <= firstHigh;
      
      // Third candle should start within second candle's range
      const thirdStartsInRange = thirdOpen >= secondLow && thirdOpen <= secondHigh;

      if (secondStartsInRange && thirdStartsInRange) {
        return { met: true, message: `${target} shows Three Red Soldiers pattern - strong bullish signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Three Red Soldiers pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkThreeRiverEveningStar(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      // Get the last 3 candles (most recent data)
      const candles = stockData.slice(-3);
      
      const firstCandle = candles[0];
      const secondCandle = candles[1];
      const thirdCandle = candles[2];

      // First candle should be a long bearish candle
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0]; // close < open
      const firstCandleSize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstIsLong = firstCandleSize > (firstCandle.data[3] - firstCandle.data[2]) * 0.6; // body is more than 60% of the range

      // Second candle should be a small bullish candle with a gap up
      const secondIsBullish = secondCandle.data[1] > secondCandle.data[0]; // close > open
      const secondCandleSize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondIsSmall = secondCandleSize < firstCandleSize * 0.5; // less than half the size of first candle
      const hasGapUp = secondCandle.data[2] > firstCandle.data[3]; // second candle's low > first candle's high

      // Third candle should be bullish
      const thirdIsBullish = thirdCandle.data[1] > thirdCandle.data[0]; // close > open

      if (firstIsBearish && firstIsLong && secondIsBullish && secondIsSmall && hasGapUp && thirdIsBullish) {
        return { met: true, message: `${target} shows Three River Evening Star pattern - potential reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Three River Evening Star pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private checkGreaterThan(currentPrice: number, conditionValue: number): boolean {
    return currentPrice > conditionValue;
  }

  private checkLessThan(currentPrice: number, conditionValue: number): boolean {
    return currentPrice < conditionValue;
  }

  private async checkTwoTakuriLines(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-3);
      const [firstCandle, secondCandle, thirdCandle] = candles;

      // First two candles should be bearish with long lower shadows
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0]; // close < open
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0]; // close < open
      
      // Check for significant lower shadows
      const firstBodyBottom = Math.min(firstCandle.data[0], firstCandle.data[1]);
      const firstLowerShadow = firstBodyBottom - firstCandle.data[2];
      const firstBodySize = Math.abs(firstCandle.data[1] - firstCandle.data[0]);
      const firstHasLongLowerShadow = firstLowerShadow > firstBodySize;

      const secondBodyBottom = Math.min(secondCandle.data[0], secondCandle.data[1]);
      const secondLowerShadow = secondBodyBottom - secondCandle.data[2];
      const secondBodySize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondHasLongLowerShadow = secondLowerShadow > secondBodySize;

      // Lows should be similar (within 2% tolerance)
      const lowTolerance = Math.abs(firstCandle.data[2] - secondCandle.data[2]) / firstCandle.data[2];
      const similarLows = lowTolerance < 0.02;

      // Third candle should be a doji-like with similar low
      const thirdBodySize = Math.abs(thirdCandle.data[1] - thirdCandle.data[0]);
      const thirdRange = thirdCandle.data[3] - thirdCandle.data[2];
      const thirdIsDoji = thirdBodySize < thirdRange * 0.1; // body is less than 10% of range
      
      const thirdLowTolerance = Math.abs(firstCandle.data[2] - thirdCandle.data[2]) / firstCandle.data[2];
      const thirdSimilarLow = thirdLowTolerance < 0.02;

      if (firstIsBearish && secondIsBearish && firstHasLongLowerShadow && secondHasLongLowerShadow && 
          similarLows && thirdIsDoji && thirdSimilarLow) {
        return { met: true, message: `${target} shows Two Takuri Lines pattern - potential bullish reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Two Takuri Lines pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkSwallowReturn(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 4 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 4) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-4);
      const [baseCandle, firstCandle, secondCandle, thirdCandle] = candles;

      // First and second candles should open higher than previous close but end bearish
      const firstGapsUp = firstCandle.data[0] > baseCandle.data[1];
      const firstIsBearish = firstCandle.data[1] < firstCandle.data[0];
      
      const secondGapsUp = secondCandle.data[0] > firstCandle.data[1];
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0];

      // Third candle should be bullish
      const thirdIsBullish = thirdCandle.data[1] > thirdCandle.data[0];

      if (firstGapsUp && firstIsBearish && secondGapsUp && secondIsBearish && thirdIsBullish) {
        return { met: true, message: `${target} shows Swallow Return pattern - bullish reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Swallow Return pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkFireworks(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 1 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 1) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candle = stockData[stockData.length - 1];
      const [open, close, low, high] = candle.data;

      // Calculate body and shadows
      const bodyTop = Math.max(open, close);
      const bodyBottom = Math.min(open, close);
      const bodySize = Math.abs(close - open);
      const upperShadow = high - bodyTop;
      const lowerShadow = bodyBottom - low;

      // Long upper shadow, short body, almost no lower shadow
      const hasLongUpperShadow = upperShadow > bodySize * 2;
      const hasShortBody = bodySize < (high - low) * 0.3;
      const hasMinimalLowerShadow = lowerShadow < bodySize * 0.1;

      if (hasLongUpperShadow && hasShortBody && hasMinimalLowerShadow) {
        return { met: true, message: `${target} shows Fireworks pattern - bearish reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Fireworks pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkOkajiThreeCrows(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-3);
      const [firstCandle, secondCandle, thirdCandle] = candles;

      // All candles should be bearish
      const allBearish = candles.every(candle => candle.data[1] < candle.data[0]);

      // Check gap patterns: first close = second open, second close = third open
      const firstCloseEqualsSecondOpen = Math.abs(firstCandle.data[1] - secondCandle.data[0]) < firstCandle.data[1] * 0.001;
      const secondCloseEqualsThirdOpen = Math.abs(secondCandle.data[1] - thirdCandle.data[0]) < secondCandle.data[1] * 0.001;

      if (allBearish && firstCloseEqualsSecondOpen && secondCloseEqualsThirdOpen) {
        return { met: true, message: `${target} shows Okaji Three Crows pattern - strong bearish signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Okaji Three Crows pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkFallingStones(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 5 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 5) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-5);
      const [bigBullCandle, ...smallCandles] = candles;

      // First candle should be a large bullish candle
      const firstIsBullish = bigBullCandle.data[1] > bigBullCandle.data[0];
      const firstBodySize = Math.abs(bigBullCandle.data[1] - bigBullCandle.data[0]);
      const firstRange = bigBullCandle.data[3] - bigBullCandle.data[2];
      const firstIsLarge = firstBodySize > firstRange * 0.7;

      // Following candles show gradual decline with lower lows
      let hasLowerLows = true;
      let previousLow = bigBullCandle.data[2];
      
      for (const candle of smallCandles) {
        if (candle.data[2] >= previousLow) {
          hasLowerLows = false;
          break;
        }
        previousLow = candle.data[2];
      }

      // Most of the following candles should be small
      const hasSmallCandles = smallCandles.every(candle => {
        const bodySize = Math.abs(candle.data[1] - candle.data[0]);
        return bodySize < firstBodySize * 0.5;
      });

      if (firstIsBullish && firstIsLarge && hasLowerLows && hasSmallCandles) {
        return { met: true, message: `${target} shows Falling Stones pattern - descending wedge bearish signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Falling Stones pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkBullishHaramiCross(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-3);
      const [firstCandle, secondCandle, thirdCandle] = candles;

      // Second candle should have a large body
      const secondBodyTop = Math.max(secondCandle.data[0], secondCandle.data[1]);
      const secondBodyBottom = Math.min(secondCandle.data[0], secondCandle.data[1]);
      const secondBodySize = Math.abs(secondCandle.data[1] - secondCandle.data[0]);
      const secondRange = secondCandle.data[3] - secondCandle.data[2];
      const secondHasLargeBody = secondBodySize > secondRange * 0.6;

      // First and third candles should be contained within second candle's body
      const firstHigh = Math.max(firstCandle.data[0], firstCandle.data[1]);
      const firstLow = Math.min(firstCandle.data[0], firstCandle.data[1]);
      const firstContained = firstHigh <= secondBodyTop && firstLow >= secondBodyBottom;

      const thirdHigh = Math.max(thirdCandle.data[0], thirdCandle.data[1]);
      const thirdLow = Math.min(thirdCandle.data[0], thirdCandle.data[1]);
      const thirdContained = thirdHigh <= secondBodyTop && thirdLow >= secondBodyBottom;

      if (secondHasLargeBody && firstContained && thirdContained) {
        return { met: true, message: `${target} shows Bullish Harami Cross pattern - potential reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Bullish Harami Cross pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkHawkReversal(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 2 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 2) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-2);
      const [firstCandle, secondCandle] = candles;

      // Second candle should be bearish and engulf the first candle
      const secondIsBearish = secondCandle.data[1] < secondCandle.data[0];
      
      // Engulfing pattern: second candle's body completely contains first candle's body
      const firstBodyTop = Math.max(firstCandle.data[0], firstCandle.data[1]);
      const firstBodyBottom = Math.min(firstCandle.data[0], firstCandle.data[1]);
      const secondBodyTop = Math.max(secondCandle.data[0], secondCandle.data[1]);
      const secondBodyBottom = Math.min(secondCandle.data[0], secondCandle.data[1]);

      const isEngulfing = secondBodyTop > firstBodyTop && secondBodyBottom < firstBodyBottom;

      if (secondIsBearish && isEngulfing) {
        return { met: true, message: `${target} shows Hawk Reversal pattern - bearish engulfing signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Hawk Reversal pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkThreeDarkStars(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 3 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 3) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candles = stockData.slice(-3);

      // All candles should be bearish with small bodies
      const allBearishAndSmall = candles.every(candle => {
        const isBearish = candle.data[1] < candle.data[0];
        const bodySize = Math.abs(candle.data[1] - candle.data[0]);
        const range = candle.data[3] - candle.data[2];
        const hasSmallBody = bodySize < range * 0.3;
        return isBearish && hasSmallBody;
      });

      if (allBearishAndSmall) {
        return { met: true, message: `${target} shows Three Dark Stars pattern - bearish continuation signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Three Dark Stars pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }

  private async checkShootingStar(target: string, exchangeKey: string, tickerKey: string): Promise<Condition> {
    try {
      const stockData = await FinanceUtil.getStockPriceData(exchangeKey, tickerKey, { count: 1 });

      if (!stockData || !Array.isArray(stockData) || stockData.length < 1) {
        return { met: false, message: `Insufficient data for ${target}` };
      }

      const candle = stockData[stockData.length - 1];
      const [open, close, low, high] = candle.data;

      // Calculate body and shadows
      const bodyTop = Math.max(open, close);
      const bodyBottom = Math.min(open, close);
      const bodySize = Math.abs(close - open);
      const upperShadow = high - bodyTop;
      const lowerShadow = bodyBottom - low;
      const range = high - low;

      // Long upper shadow, short body (usually bearish), small lower shadow
      const hasLongUpperShadow = upperShadow > bodySize * 2;
      const hasShortBody = bodySize < range * 0.3;
      const hasSmallLowerShadow = lowerShadow < bodySize;
      const isBearish = close < open;

      if (hasLongUpperShadow && hasShortBody && hasSmallLowerShadow && isBearish) {
        return { met: true, message: `${target} shows Shooting Star pattern - bearish reversal signal detected` };
      }

      return { met: false, message: '' };
    } catch (error) {
      console.error('Error checking Shooting Star pattern:', error);
      return { met: false, message: `Error checking pattern for ${target}` };
    }
  }
}
