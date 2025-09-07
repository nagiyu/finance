import { FinanceNotificationConditionType } from '@finance/types/FinanceNotificationType';
import { BaseConditionChecker, Condition, ConditionCheckParams } from './BaseConditionChecker';
import { GreaterThanConditionChecker } from './GreaterThanConditionChecker';
import { LessThanConditionChecker } from './LessThanConditionChecker';
import { ThreeRedSoldiersConditionChecker } from './ThreeRedSoldiersConditionChecker';
import { TwoTakuriLinesConditionChecker } from './TwoTakuriLinesConditionChecker';
import { ThreeRiverEveningStarConditionChecker } from './ThreeRiverEveningStarConditionChecker';
import { SwallowReturnConditionChecker } from './SwallowReturnConditionChecker';
import { FireworksConditionChecker } from './FireworksConditionChecker';
import { OkajiThreeCrowsConditionChecker } from './OkajiThreeCrowsConditionChecker';
import { FallingStonesConditionChecker } from './FallingStonesConditionChecker';
import { BullishHaramiCrossConditionChecker } from './BullishHaramiCrossConditionChecker';
import { BearishHaramiCrossConditionChecker } from './BearishHaramiCrossConditionChecker';
import { HawkReversalConditionChecker } from './HawkReversalConditionChecker';
import { ThreeDarkStarsConditionChecker } from './ThreeDarkStarsConditionChecker';
import { ShootingStarConditionChecker } from './ShootingStarConditionChecker';

export interface ConditionCheckerProviderOptions {
  fallbackHandler?: (conditionType: FinanceNotificationConditionType, params: ConditionCheckParams) => Promise<Condition>;
}

export class ConditionCheckerProvider {
  private checkers: Map<FinanceNotificationConditionType, BaseConditionChecker>;
  private fallbackHandler?: (conditionType: FinanceNotificationConditionType, params: ConditionCheckParams) => Promise<Condition>;

  constructor(options?: ConditionCheckerProviderOptions) {
    this.checkers = new Map();
    this.fallbackHandler = options?.fallbackHandler;
    this.initializeCheckers();
  }

  private initializeCheckers(): void {
    const checkerInstances = [
      new GreaterThanConditionChecker(),
      new LessThanConditionChecker(),
      new ThreeRedSoldiersConditionChecker(),
      new TwoTakuriLinesConditionChecker(),
      new ThreeRiverEveningStarConditionChecker(),
      new SwallowReturnConditionChecker(),
      new FireworksConditionChecker(),
      new OkajiThreeCrowsConditionChecker(),
      new FallingStonesConditionChecker(),
      new BullishHaramiCrossConditionChecker(),
      new BearishHaramiCrossConditionChecker(),
      new HawkReversalConditionChecker(),
      new ThreeDarkStarsConditionChecker(),
      new ShootingStarConditionChecker(),
    ];

    for (const checker of checkerInstances) {
      this.checkers.set(checker.conditionType, checker);
    }
  }

  public getChecker(conditionType: FinanceNotificationConditionType): BaseConditionChecker | null {
    return this.checkers.get(conditionType) || null;
  }

  public async checkCondition(
    conditionType: FinanceNotificationConditionType,
    params: ConditionCheckParams
  ): Promise<Condition> {
    const checker = this.getChecker(conditionType);
    
    if (checker) {
      return await checker.check(params);
    }
    
    // Use fallback handler if available
    if (this.fallbackHandler) {
      return await this.fallbackHandler(conditionType, params);
    }
    
    // Default fallback
    return {
      met: false,
      message: `Condition checker not implemented for type: ${conditionType}`
    };
  }

  public getSupportedConditionTypes(): FinanceNotificationConditionType[] {
    return Array.from(this.checkers.keys());
  }

  public hasChecker(conditionType: FinanceNotificationConditionType): boolean {
    return this.checkers.has(conditionType);
  }
}