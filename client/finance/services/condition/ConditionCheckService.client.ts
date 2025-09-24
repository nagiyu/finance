import ResponseValidator from '@client-common/utils/ResponseValidator';

interface ConditionCheckResult {
  name: string;
  key: string;
  isBuyCondition: boolean;
  isSellCondition: boolean;
}

interface ConditionCheckResponse {
  conditions: ConditionCheckResult[];
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

    try {
      const response = await fetch(`/api/finance-notification/conditions/check?${params.toString()}`, {
        method: 'GET'
      });

      ResponseValidator.ValidateResponse(response);

      const result: ConditionCheckResponse = await response.json();
      return result.conditions || [];
    } catch (error) {
      console.error('Failed to check conditions:', error);
      return [];
    }
  }
}