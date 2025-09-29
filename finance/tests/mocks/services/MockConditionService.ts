/**
 * Mock ConditionService for testing simplified notification configuration
 */
export class MockConditionService {
  public getBuyConditionList(): string[] {
    return ['GreaterThan', 'SansenAkenomyojo', 'GyakusanZon'];
  }

  public getSellConditionList(): string[] {
    return ['LessThan', 'DoubleTop', 'SanZon'];
  }

  public getConditionInfo(conditionName: string) {
    const conditionInfoMap: Record<string, any> = {
      'GreaterThan': { enableTargetPrice: true, isBuyCondition: true, isSellCondition: false },
      'LessThan': { enableTargetPrice: true, isBuyCondition: false, isSellCondition: true },
      'SansenAkenomyojo': { enableTargetPrice: false, isBuyCondition: true, isSellCondition: false },
      'GyakusanZon': { enableTargetPrice: false, isBuyCondition: true, isSellCondition: false },
      'DoubleTop': { enableTargetPrice: false, isBuyCondition: false, isSellCondition: true },
      'SanZon': { enableTargetPrice: false, isBuyCondition: false, isSellCondition: true },
    };
    return conditionInfoMap[conditionName];
  }
}