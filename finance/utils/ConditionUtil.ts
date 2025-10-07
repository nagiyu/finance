import ErrorUtil from '@common/utils/ErrorUtil';

import AscendingTriangleCondition, { AscendingTriangleConditionInfo } from '@finance/conditions/AscendingTriangleCondition';
import BearCollarCondition, { BearCollarConditionInfo } from '@finance/conditions/BearCollarCondition';
import BullFlagCondition, { BullFlagConditionInfo } from '@finance/conditions/BullFlagCondition';
import ConditionBase, { ConditionInfo } from '@finance/conditions/ConditionBase';
import DoubleTopCondition, { DoubleTopConditionInfo } from '@finance/conditions/DoubleTopCondition';
import ExchangeService from '@finance/services/ExchangeService';
import GreaterThanCondition, { GreaterThanConditionInfo } from '@finance/conditions/GreaterThanCondition';
import GyakusanzonCondition, { GyakusanzonConditionInfo } from '@finance/conditions/GyakusanzonCondition';
import LessThanCondition, { LessThanConditionInfo } from '@finance/conditions/LessThanCondition';
import RisingDoubleBottomCondition, { RisingDoubleBottomConditionInfo } from '@finance/conditions/RisingDoubleBottomCondition';
import RisingWedgeCondition, { RisingWedgeConditionInfo } from '@finance/conditions/RisingWedgeCondition';
import SansenAkenomyojoCondition, { SansenAkenomyojoConditionInfo } from '@finance/conditions/SansenAkenomyojoCondition';
import SansenYoinomyojoCondition, { SansenYoinomyojoConditionInfo } from '@finance/conditions/SansenYoinomyojoCondition';
import SanzonCondition, { SanzonConditionInfo } from '@finance/conditions/SanzonCondition';
import TickerService from '@finance/services/TickerService';

export type ConditionConstructor = new (exchangeService: ExchangeService, tickerService: TickerService) => ConditionBase;

export interface ConditionMap {
  [key: string]: {
    info: ConditionInfo;
    condition: ConditionConstructor;
  };
}

/**
 * Utility class for managing condition map and related operations.
 */
export default class ConditionUtil {
  /**
   * Condition map containing all available conditions
   */
  private static readonly conditionMap: ConditionMap = {
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
    Gyakusanzon: {
      info: GyakusanzonConditionInfo,
      condition: GyakusanzonCondition
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
    BullFlag: {
      info: BullFlagConditionInfo,
      condition: BullFlagCondition
    },
  };

  /**
   * Gets the list of buy conditions.
   * @returns List of buy condition keys
   */
  public static getBuyConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => value.info.isBuyCondition)
      .map(([key]) => key);
  }

  /**
   * Gets the list of sell conditions.
   * @returns List of sell condition keys
   */
  public static getSellConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => value.info.isSellCondition)
      .map(([key]) => key);
  }

  /**
   * Gets the list of conditions that don't require target price.
   * @returns List of condition keys that can be evaluated without target price
   */
  public static getEvaluableConditionList(): string[] {
    return Object.entries(this.conditionMap)
      .filter(([, value]) => !value.info.enableTargetPrice)
      .map(([key]) => key);
  }

  /**
   * Gets the information about a specific condition.
   * @param conditionName Condition Name
   * @returns Condition Information
   */
  public static getConditionInfo(conditionName: string): ConditionInfo {
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
  public static getCondition(conditionName: string): ConditionConstructor {
    const condition = this.conditionMap[conditionName];

    if (!condition) {
      ErrorUtil.throwError(`Condition ${conditionName} not found`);
    }

    return condition.condition;
  }

  /**
   * Gets the Japanese display name for a condition.
   * @param conditionKey Condition key (e.g., "SansenAkenomyojo")
   * @returns Japanese display name (e.g., "三川明けの明星")
   */
  public static getConditionDisplayName(conditionKey: string): string {
    const condition = this.conditionMap[conditionKey];

    if (!condition) {
      return conditionKey; // Return the key itself if not found
    }

    return condition.info.name;
  }
}
