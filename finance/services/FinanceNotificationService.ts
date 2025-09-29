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
import { FinanceNotificationCondition, FinanceNotificationSimplifiedConfig } from '@finance/interfaces/FinanceNotificationType';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';
import { FinanceNotificationRecordType } from '@finance/interfaces/record/FinanceNotificationRecordType';
import { FINANCE_NOTIFICATION_FREQUENCY, FINANCE_NOTIFICATION_CONDITION_MODE } from '@finance/consts/FinanceNotificationConst';

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
    notificationService: NotificationServiceType,
    useCache: boolean = true
  ) {
    super(dataAccessor, useCache);

    this.exchangeService = exchangeService;
    this.tickerService = tickerService;
    this.conditionService = conditionService;
    this.notificationService = notificationService;
  }

  public override async create(creates: Partial<FinanceNotificationDataType>): Promise<FinanceNotificationDataType> {
    if (!creates.conditionList) {
      ErrorUtil.throwError(`Condition list is required`);
    }

    // Check for duplicate Exchange and Ticker combination per terminal
    await this.validateUniqueExchangeTicker(creates.exchangeId, creates.tickerId, creates.terminalId);

    creates.conditionList.forEach(condition => {
      condition.firstNotificationSent = false;
    });
    return await super.create(creates);
  }

  public override async update(id: string, updates: Partial<FinanceNotificationDataType>): Promise<FinanceNotificationDataType> {
    if (!updates.conditionList) {
      ErrorUtil.throwError(`Condition list is required`);
    }

    // Check for duplicate Exchange and Ticker combination per terminal (excluding current record)
    if (updates.exchangeId || updates.tickerId) {
      // Get current record to get missing exchange/ticker IDs
      const currentRecord = await this.getById(id);
      if (!currentRecord) {
        ErrorUtil.throwError(`Finance Notification with ID ${id} not found`);
      }

      const exchangeId = updates.exchangeId || currentRecord.exchangeId;
      const tickerId = updates.tickerId || currentRecord.tickerId;
      const terminalId = updates.terminalId || currentRecord.terminalId;
      
      await this.validateUniqueExchangeTicker(exchangeId, tickerId, terminalId, id);
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

        // Check if conditionList exists and is not empty
        if (!notification.conditionList || notification.conditionList.length === 0) {
          console.log(`No conditions defined for notification ${notification.id}, skipping`);
          continue;
        }

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
        if (!conditionsToCheck || conditionsToCheck.length === 0) {
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
              condition.targetPrice,
              condition.frequency,
              condition.timeframe
            );
          } catch (error) {
            console.error(`Error checking condition ${condition.conditionName}:`, error);
            return { met: false, message: '' };
          }
        });

        // Wait for all conditions to complete and find the first met condition
        const results = await Promise.allSettled(conditionPromises);

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const condition = conditionsToCheck[i];
          
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

            // Include exchange, ticker, and timeframe data in the message
            const messageWithData = JSON.stringify({
              message: conditionResult.message || '',
              exchangeId: notification.exchangeId,
              tickerId: notification.tickerId,
              timeframe: condition.timeframe
            });

            await this.notificationService.sendPushNotification(endpoint, messageWithData, subscription);
          }
        }

        // Only update firstNotificationSent flags if any conditions were processed
        const needsUpdate = notification.conditionList && notification.conditionList.some(condition => !condition.firstNotificationSent);
        
        if (needsUpdate) {
          // Get the latest data to ensure we don't overwrite recent changes
          const latestNotification = await super.getById(notification.id);
          
          if (latestNotification && latestNotification.conditionList) {
            // Update only the firstNotificationSent flags on the latest data
            latestNotification.conditionList.forEach(latestCondition => {
              const processedCondition = notification.conditionList?.find(c => c.id === latestCondition.id);
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

  /**
   * Validate that the Exchange and Ticker combination is unique per terminal
   * @param exchangeId - Exchange ID to validate
   * @param tickerId - Ticker ID to validate  
   * @param terminalId - Terminal ID to limit validation scope
   * @param excludeId - ID to exclude from validation (for updates)
   */
  private async validateUniqueExchangeTicker(exchangeId?: string, tickerId?: string, terminalId?: string, excludeId?: string): Promise<void> {
    if (!exchangeId || !tickerId || !terminalId) {
      return; // Skip validation if any required parameter is missing
    }

    const existingNotifications = await this.get();
    
    const duplicateNotification = existingNotifications.find(notification => 
      notification.id !== excludeId && 
      notification.terminalId === terminalId &&
      notification.exchangeId === exchangeId && 
      notification.tickerId === tickerId
    );

    if (duplicateNotification) {
      ErrorUtil.throwError(`指定された Exchange と Ticker の組み合わせは既に登録されています`);
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

  /**
   * Generate condition list from simplified configuration (buy/sell mode based)
   * This method creates a condition list based on mode selection and automatically
   * filters out conditions that don't require target price when none is provided.
   * 
   * @param config Simplified notification configuration
   * @returns Generated condition list for notification
   */
  public generateConditionListFromMode(config: FinanceNotificationSimplifiedConfig): FinanceNotificationCondition[] {
    const { mode, frequency, session, timeframe, targetPrice } = config;
    
    // Get all conditions based on mode
    const applicableConditions = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY 
      ? this.conditionService.getBuyConditionList()
      : this.conditionService.getSellConditionList();

    const conditionList: FinanceNotificationCondition[] = [];

    for (const conditionName of applicableConditions) {
      const conditionInfo = this.conditionService.getConditionInfo(conditionName);
      
      // If target price is not provided, skip conditions that require it
      if (!targetPrice && conditionInfo.enableTargetPrice) {
        continue;
      }

      // Create condition configuration
      const condition: FinanceNotificationCondition = {
        id: null, // Will be set when saved to database
        mode,
        conditionName,
        frequency,
        session,
        timeframe,
        targetPrice: conditionInfo.enableTargetPrice ? targetPrice : null,
        firstNotificationSent: false,
      };

      conditionList.push(condition);
    }

    return conditionList;
  }

  /**
   * Create notification using simplified mode-based configuration
   * This is the new improved method that works with buy/sell mode selection
   * instead of manual condition configuration.
   * 
   * @param creates Base notification data
   * @param config Simplified configuration
   * @returns Created notification
   */
  public async createWithSimplifiedConfig(
    creates: Omit<Partial<FinanceNotificationDataType>, 'conditionList'>,
    config: FinanceNotificationSimplifiedConfig
  ): Promise<FinanceNotificationDataType> {
    // Generate condition list from simplified config
    const conditionList = this.generateConditionListFromMode(config);

    if (conditionList.length === 0) {
      ErrorUtil.throwError(`No applicable conditions found for mode ${config.mode} with current configuration`);
    }

    // Create the full notification data
    const notificationData: Partial<FinanceNotificationDataType> = {
      ...creates,
      conditionList,
    };

    return await this.create(notificationData);
  }

  /**
   * Check conditions using simplified mode-based approach
   * This method checks all conditions that match the specified mode for a given
   * exchange and ticker, filtering by target price requirements.
   * 
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param config Simplified configuration for condition checking
   * @returns Promise that resolves to the first met condition result
   */
  public async checkConditionsWithMode(
    exchangeId: string,
    tickerId: string,
    config: FinanceNotificationSimplifiedConfig
  ): Promise<ConditionResult | null> {
    const { mode, session, timeframe, targetPrice } = config;

    // Get all conditions based on mode
    const applicableConditions = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY 
      ? this.conditionService.getBuyConditionList()
      : this.conditionService.getSellConditionList();

    // Filter conditions based on target price availability
    const conditionsToCheck = applicableConditions.filter(conditionName => {
      const conditionInfo = this.conditionService.getConditionInfo(conditionName);
      
      // If target price is not provided, skip conditions that require it
      if (!targetPrice && conditionInfo.enableTargetPrice) {
        return false;
      }
      
      return true;
    });

    if (conditionsToCheck.length === 0) {
      console.log(`No applicable conditions found for mode ${mode} with current configuration`);
      return null;
    }

    // Check all conditions in parallel
    const conditionPromises = conditionsToCheck.map(async (conditionName) => {
      try {
        const conditionInfo = this.conditionService.getConditionInfo(conditionName);
        return await this.conditionService.checkCondition(
          conditionName,
          exchangeId,
          tickerId,
          session,
          conditionInfo.enableTargetPrice ? targetPrice : null,
          config.frequency,
          timeframe
        );
      } catch (error) {
        console.error(`Error checking condition ${conditionName}:`, error);
        return { met: false, message: '' };
      }
    });

    // Wait for all conditions to complete and find the first met condition
    const results = await Promise.allSettled(conditionPromises);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const conditionName = conditionsToCheck[i];
      
      if (result.status === 'fulfilled') {
        const conditionResult: ConditionResult = result.value;

        if (conditionResult.met) {
          console.log(`Condition ${conditionName} met for ${mode} mode`);
          return conditionResult;
        }
      } else {
        console.error(`Failed to check condition ${conditionName}:`, result.reason);
      }
    }

    return null;
  }
}
