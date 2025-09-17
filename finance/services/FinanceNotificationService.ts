import CRUDServiceBase from '@common/services/CRUDServiceBase';
import DateUtil from '@common/utils/DateUtil';
import ErrorUtil from '@common/utils/ErrorUtil';
import { NotificationServiceType } from '@common/services/NotificationService';
import TimeUtil from '@common/utils/TimeUtil';
import { SubscriptionType } from '@common/interfaces/SubscriptionType';

import ConditionService, { ConditionResult } from '@finance/services/ConditionService';
import ExchangeService from '@finance/services/ExchangeService';
import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import TickerService from '@finance/services/TickerService';
import { ExchangeDataType } from '@finance/interfaces/data/ExchangeDataType';
import { FinanceNotificationCondition } from '@finance/interfaces/FinanceNotificationType';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';
import { FINANCE_NOTIFICATION_FREQUENCY } from '@finance/consts/FinanceNotificationConst';

export default class FinanceNotificationService extends CRUDServiceBase<FinanceNotificationDataType, FinanceNotificationRecordType> {
  private readonly exchangeService: ExchangeService;
  private readonly tickerService: TickerService;
  private readonly conditionService: ConditionService;
  private readonly notificationService: NotificationServiceType;

  public constructor(
    dataAccessor: FinanceNotificationDataAccessor,
    exchangeService: ExchangeService,
    tickerService: TickerService,
    conditionService: ConditionService,
    notificationService: NotificationServiceType
  ) {
    super(dataAccessor);

    this.exchangeService = exchangeService;
    this.tickerService = tickerService;
    this.conditionService = conditionService;
    this.notificationService = notificationService;
  }

  public override async create(creates: Partial<FinanceNotificationDataType>): Promise<FinanceNotificationDataType> {
    if (!creates.conditionList) {
      ErrorUtil.throwError(`Condition list is required`);
    }

    creates.conditionList.forEach(condition => {
      condition.firstNotificationSent = false;
    });
    return await super.create(creates);
  }

  public override async update(id: string, updates: Partial<FinanceNotificationDataType>): Promise<FinanceNotificationDataType> {
    if (!updates.conditionList) {
      ErrorUtil.throwError(`Condition list is required`);
    }

    updates.conditionList.forEach(condition => {
      condition.firstNotificationSent = false;
    });
    return await super.update(id, updates);
  }

  public async notification(endpoint: string): Promise<void> {
    const notifications = await this.get();

    const errors: string[] = [];

    for (const notification of notifications) {
      try {
        console.log(`Looking up exchange and ticker data for notification ${notification.id}`);

        const exchange = await this.exchangeService.getById(notification.exchangeId);
        if (!exchange) {
          ErrorUtil.throwError(`Exchange not found for ID: ${notification.exchangeId}`);
        }

        const ticker = await this.tickerService.getById(notification.tickerId);
        if (!ticker) {
          ErrorUtil.throwError(`Ticker not found for ID: ${notification.tickerId}`);
        }

        console.log(`Checking condition for ${exchange.key}:${ticker.key}`);

        // Filter conditions that should be checked based on timing
        const conditionsToCheck = notification.conditionList.filter(condition => {
          if (!this.shouldCheckCondition(condition, exchange)) {
            // For pattern conditions, if it's the first notification, allow it to be checked
            if (!condition.firstNotificationSent) {
              return true;
            }

            console.log(`Condition ${condition.conditionName} skipped due to frequency constraint: ${condition.frequency}`);
            return false;
          }

          return true;
        });

        // If there are conditions to check, run them in parallel
        if (conditionsToCheck.length === 0) {
          console.log(`No conditions to check for notification ${notification.id} at this time`);
          continue;
        }

        // Start all condition checks in parallel
        const conditionPromises = conditionsToCheck.map(async (condition) => {
          try {
            return await this.conditionService.checkCondition(
              condition.conditionName,
              exchange.id,
              ticker.id,
              condition.session,
              condition.targetPrice
            );
          } catch (error) {
            console.error(`Error checking condition ${condition.conditionName}:`, error);
            return { met: false, message: '' };
          }
        });

        // Wait for all conditions to complete and find the first met condition
        const results = await Promise.allSettled(conditionPromises);

        for (const result of results) {
          if (result.status === 'fulfilled') {
            const conditionResult: ConditionResult = result.value;

            if (!conditionResult.met) {
              console.log(`Condition not met for notification ${notification.id}, skipping push notification`);
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

            await this.notificationService.sendPushNotification(endpoint, conditionResult.message || '', subscription);
          }
        }

        // Only update firstNotificationSent flags if any conditions were processed
        const needsUpdate = notification.conditionList.some(condition => !condition.firstNotificationSent);
        
        if (needsUpdate) {
          // Get the latest data to ensure we don't overwrite recent changes
          const latestNotification = await super.getById(notification.id);
          
          if (latestNotification) {
            // Update only the firstNotificationSent flags on the latest data
            latestNotification.conditionList.forEach(latestCondition => {
              const processedCondition = notification.conditionList.find(c => c.id === latestCondition.id);
              if (processedCondition && !processedCondition.firstNotificationSent) {
                latestCondition.firstNotificationSent = true;
              }
            });

            await super.update(notification.id, { conditionList: latestNotification.conditionList });
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

  protected dataToRecord(data: Partial<FinanceNotificationDataType>): Partial<FinanceNotificationRecordType> {
    return {
      TerminalID: data.terminalId,
      SubscriptionEndpoint: data.subscriptionEndpoint,
      SubscriptionKeysP256dh: data.subscriptionKeysP256dh,
      SubscriptionKeysAuth: data.subscriptionKeysAuth,
      ExchangeID: data.exchangeId,
      TickerID: data.tickerId,
      ConditionList: data.conditionList,
    };
  }

  protected recordToData(record: FinanceNotificationRecordType): FinanceNotificationDataType {
    return {
      id: record.ID,
      terminalId: record.TerminalID,
      subscriptionEndpoint: record.SubscriptionEndpoint,
      subscriptionKeysP256dh: record.SubscriptionKeysP256dh,
      subscriptionKeysAuth: record.SubscriptionKeysAuth,
      exchangeId: record.ExchangeID,
      tickerId: record.TickerID,
      conditionList: record.ConditionList,
      create: record.Create,
      update: record.Update,
    };
  }

  /**
   * Check if a specific condition should be checked based on its frequency setting
   */
  private shouldCheckCondition(
    conditionWithFrequency: FinanceNotificationCondition,
    exchange: ExchangeDataType
  ): boolean {
    const currentTime = DateUtil.getNowJSTAsDate();

    // First check if we're within exchange hours
    if (!this.isWithinExchangeHours(exchange, currentTime)) {
      return false;
    }

    switch (conditionWithFrequency.frequency) {
      case FINANCE_NOTIFICATION_FREQUENCY.EXCHANGE_START_ONLY:
        return this.isExchangeStartTime(exchange, currentTime);

      case FINANCE_NOTIFICATION_FREQUENCY.MINUTE_LEVEL:
        return true;

      case FINANCE_NOTIFICATION_FREQUENCY.TEN_MINUTE_LEVEL:
        return this.isTenMinuteInterval(currentTime);

      case FINANCE_NOTIFICATION_FREQUENCY.HOURLY_LEVEL:
        return this.isHourlyInterval(currentTime);

      default:
        console.log(`Unknown frequency: ${conditionWithFrequency.frequency}`);
        return false;
    }
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
}
