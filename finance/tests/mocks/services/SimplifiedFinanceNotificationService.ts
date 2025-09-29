/**
 * Simplified version of FinanceNotificationService for testing new methods only
 */
import { FINANCE_NOTIFICATION_CONDITION_MODE } from '../../../consts/FinanceNotificationConst';
import { FinanceNotificationSimplifiedConfig } from '../../../interfaces/FinanceNotificationType';
import { MockConditionService } from './MockConditionService';

export class SimplifiedFinanceNotificationService {
  private conditionService: MockConditionService;

  constructor() {
    this.conditionService = new MockConditionService();
  }

  public generateConditionListFromMode(config: FinanceNotificationSimplifiedConfig) {
    const { mode, frequency, session, timeframe, targetPrice } = config;
    
    // Get all conditions based on mode
    const applicableConditions = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY 
      ? this.conditionService.getBuyConditionList()
      : this.conditionService.getSellConditionList();

    const conditionList: any[] = [];

    for (const conditionName of applicableConditions) {
      const conditionInfo = this.conditionService.getConditionInfo(conditionName);
      
      // If target price is not provided, skip conditions that require it
      if (!targetPrice && conditionInfo.enableTargetPrice) {
        continue;
      }

      // Create condition configuration
      const condition = {
        id: null,
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
}