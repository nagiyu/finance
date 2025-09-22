import APIUtil from '@client-common/utils/APIUtil';

interface ConditionCheckResult {
  name: string;
  key: string;
  isBuyCondition: boolean;
  isSellCondition: boolean;
}

export default class ConditionCheckService {
  /**
   * Check applicable conditions for given exchange and ticker
   */
  async checkConditions(
    exchangeId: string,
    tickerId: string,
    timeframe?: string,
    session?: string
  ): Promise<ConditionCheckResult[]> {
    const params = new URLSearchParams({
      exchangeId,
      tickerId,
    });

    if (timeframe) {
      params.append('timeframe', timeframe);
    }

    if (session) {
      params.append('session', session);
    }

    const response = await APIUtil.get(`/api/finance-notification/conditions/check?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data.conditions || [];
    }

    return [];
  }
}