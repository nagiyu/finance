import ErrorUtil from '@common/utils/ErrorUtil';

import ExchangeService from '@finance/services/ExchangeService';
import TickerService from '@finance/services/TickerService';
import ConditionUtil from '@finance/utils/ConditionUtil';
import FrequencyUtil from '@finance/utils/FrequencyUtil';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { FinanceNotificationFrequencyType } from '@finance/types/FinanceNotificationType';
import { TimeFrame } from '@finance/utils/FinanceUtil';

export interface ConditionResult {
  /**
   * Indicates if the condition was met
   */
  met: boolean;

  /**
   * Optional message providing additional context
   */
  message?: string;
}

export default class ConditionService {
  private exchangeService: ExchangeService;
  private tickerService: TickerService;

  constructor(
    exchangeService: ExchangeService = new ExchangeService(),
    tickerService: TickerService = new TickerService()
  ) {
    this.exchangeService = exchangeService;
    this.tickerService = tickerService;
  }

  /**
   * Gets the list of buy conditions.
   * @returns List of buy condition keys
   */
  public getBuyConditionList(): string[] {
    return ConditionUtil.getBuyConditionList();
  }

  /**
   * Gets the list of sell conditions.
   * @returns List of sell condition keys
   */
  public getSellConditionList(): string[] {
    return ConditionUtil.getSellConditionList();
  }

  /**
   * Gets the list of conditions that don't require target price.
   * @returns List of condition keys that can be evaluated without target price
   */
  public getEvaluableConditionList(): string[] {
    return ConditionUtil.getEvaluableConditionList();
  }

  /**
   * Gets the information about a specific condition.
   * @param conditionName Condition Name
   * @returns Condition Information
   */
  public getConditionInfo(conditionName: string) {
    return ConditionUtil.getConditionInfo(conditionName);
  }

  /**
   * Gets the condition class by name.
   * @param conditionName Condition Name
   * @returns Condition Class
   */
  public getCondition(conditionName: string) {
    return ConditionUtil.getCondition(conditionName);
  }

  /**
   * Checks if the specified condition is met.
   * @param conditionName Condition Name
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param session Exchange session type
   * @param targetPrice Target price (optional)
   * @param frequency Notification frequency (optional)
   * @param timeframe Timeframe for candlestick data (optional, defaults to '1')
   * @returns Promise that resolves to true if the condition is met, false otherwise
   */
  public async checkCondition(
    conditionName: string,
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null,
    frequency?: FinanceNotificationFrequencyType,
    timeframe?: TimeFrame | null
  ): Promise<ConditionResult> {
    const ConditionClass = this.getCondition(conditionName);
    const condition = new ConditionClass(this.exchangeService, this.tickerService);
    const met = await condition.checkCondition(exchangeId, tickerId, session, targetPrice, timeframe);

    if (!met) {
      return { met };
    }

    const message = await this.getNotificationMessage(this.getConditionInfo(conditionName).name, tickerId, frequency);
    return { met, message };
  }

  private async getNotificationMessage(conditionName: string, tickerId: string, frequency?: FinanceNotificationFrequencyType): Promise<string> {
    const ticker = await this.tickerService.getById(tickerId);
    if (!ticker) {
      ErrorUtil.throwError(`Ticker with ID ${tickerId} not found`);
    }

    let message = `${ticker.name} shows ${conditionName} pattern - signal detected`;
    
    if (frequency) {
      const frequencyText = FrequencyUtil.formatFrequency(frequency);
      message += ` (通知頻度: ${frequencyText})`;
    }

    return message;
  }
}
