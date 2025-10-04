import ConditionUtil from '@finance/utils/ConditionUtil';

export default class ConditionClientUtil {
  /**
   * Format condition key to display name (Japanese)
   * @param conditionKey Condition key (e.g., "SansenAkenomyojo")
   * @returns Japanese display name (e.g., "三川明けの明星")
   */
  public static formatCondition(conditionKey: string): string {
    return ConditionUtil.getConditionDisplayName(conditionKey);
  }
}
