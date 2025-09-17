import ErrorUtil from '@common/utils/ErrorUtil';

import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import ExchangeService from '@finance/services/ExchangeService';
import GreaterThanCondition, { GreaterThanConditionInfo } from '@finance/conditions/GreaterThanCondition';
import LessThanCondition, { LessThanConditionInfo } from '@finance/conditions/LessThanCondition';
import SansenAkenomyojoCondition, { SansenAkenomyojoConditionInfo } from '@finance/conditions/SansenAkenomyojoCondition';
import TickerService from '@finance/services/TickerService';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';

type ConditionConstructor = new (exchangeService: ExchangeService, tickerService: TickerService) => ConditionBase;

interface ConditionMap {
  [key: string]: {
    info: ConditionInfo;
    condition: ConditionConstructor;
  };
}

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
   * Condition map
   */
  private conditionMap: ConditionMap = {
    GreaterThan: {
      info: GreaterThanConditionInfo,
      condition: GreaterThanCondition
    },
    LessThan: {
      info: LessThanConditionInfo,
      condition: LessThanCondition
    },
    SansenAkenomyojo: {
      info: SansenAkenomyojoConditionInfo,
      condition: SansenAkenomyojoCondition
    },
  };

  /**
   * Gets the list of buy conditions.
   * @returns List of buy condition keys
   */
  public getBuyConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => value.info.isBuyCondition)
      .map(([key]) => key);
  }

  /**
   * Gets the list of sell conditions.
   * @returns List of sell condition keys
   */
  public getSellConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => value.info.isSellCondition)
      .map(([key]) => key);
  }

  /**
   * Gets the information about a specific condition.
   * @param conditionName Condition Name
   * @returns Condition Information
   */
  public getConditionInfo(conditionName: string): ConditionInfo {
    const condition = this.conditionMap[conditionName];

    if (!condition) {
      ErrorUtil.throwError(`Condition ${conditionName} not found`);
    }

    return condition.info;
  }

  /**
   * Gets the condition class by name.
   * @param conditionName Condition Name
   * @returns Condition Class
   */
  public getCondition(conditionName: string): ConditionConstructor {
    const condition = this.conditionMap[conditionName];

    if (!condition) {
      ErrorUtil.throwError(`Condition ${conditionName} not found`);
    }

    return condition.condition;
  }

  /**
   * Checks if the specified condition is met.
   * @param conditionName Condition Name
   * @param exchangeId Exchange ID
   * @param tickerId Ticker ID
   * @param session Exchange session type
   * @param targetPrice Target price (optional)
   * @returns Promise that resolves to true if the condition is met, false otherwise
   */
  public async checkCondition(
    conditionName: string,
    exchangeId: string,
    tickerId: string,
    session?: ExchangeSessionType,
    targetPrice?: number | null
  ): Promise<ConditionResult> {
    const ConditionClass = this.getCondition(conditionName);
    const condition = new ConditionClass(this.exchangeService, this.tickerService);
    const met = await condition.checkCondition(exchangeId, tickerId, session, targetPrice);

    if (!met) {
      return { met };
    }

    const message = await this.getNotificationMessage(this.getConditionInfo(conditionName).name, tickerId);
    return { met, message };
  }

  private async getNotificationMessage(conditionName: string, tickerId: string): Promise<string> {
    const ticker = await this.tickerService.getById(tickerId);
    if (!ticker) {
      ErrorUtil.throwError(`Ticker with ID ${tickerId} not found`);
    }

    return `${ticker.name} shows ${conditionName} pattern - signal detected`;
  }
}
