import ErrorUtil from '@common/utils/ErrorUtil';

import AscendingTriangleCondition, { AscendingTriangleConditionInfo } from '@finance/conditions/AscendingTriangleCondition';
import BearCollarCondition, { BearCollarConditionInfo } from '@finance/conditions/BearCollarCondition';
import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import DoubleTopCondition, { DoubleTopConditionInfo } from '@finance/conditions/DoubleTopCondition';
import ExchangeService from '@finance/services/ExchangeService';
import GreaterThanCondition, { GreaterThanConditionInfo } from '@finance/conditions/GreaterThanCondition';
import LessThanCondition, { LessThanConditionInfo } from '@finance/conditions/LessThanCondition';
import RisingDoubleBottomCondition, { RisingDoubleBottomConditionInfo } from '@finance/conditions/RisingDoubleBottomCondition';
import RisingWedgeCondition, { RisingWedgeConditionInfo } from '@finance/conditions/RisingWedgeCondition';
import SansenAkenomyojoCondition, { SansenAkenomyojoConditionInfo } from '@finance/conditions/SansenAkenomyojoCondition';
import SansenYoinomyojoCondition, { SansenYoinomyojoConditionInfo } from '@finance/conditions/SansenYoinomyojoCondition';
import SanzonCondition, { SanzonConditionInfo } from '@finance/conditions/SanzonCondition';
import TickerService from '@finance/services/TickerService';
import FrequencyUtil from '@finance/utils/FrequencyUtil';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { FinanceNotificationFrequencyType } from '@finance/types/FinanceNotificationType';
import { TimeFrame } from '@finance/utils/FinanceUtil';

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
    SansenYoinomyojo: {
      info: SansenYoinomyojoConditionInfo,
      condition: SansenYoinomyojoCondition
    },
    Sanzon: {
      info: SanzonConditionInfo,
      condition: SanzonCondition
    },
    DoubleTop: {
      info: DoubleTopConditionInfo,
      condition: DoubleTopCondition
    },
    RisingDoubleBottom: {
      info: RisingDoubleBottomConditionInfo,
      condition: RisingDoubleBottomCondition
    },
    BearCollar: {
      info: BearCollarConditionInfo,
      condition: BearCollarCondition
    },
    RisingWedge: {
      info: RisingWedgeConditionInfo,
      condition: RisingWedgeCondition
    },
    AscendingTriangle: {
      info: AscendingTriangleConditionInfo,
      condition: AscendingTriangleCondition
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
   * Gets the list of conditions that don't require target price.
   * @returns List of condition keys that can be evaluated without target price
   */
  public getEvaluableConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => !value.info.enableTargetPrice)
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
