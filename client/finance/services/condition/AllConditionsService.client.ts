import ResponseValidator from '@client-common/utils/ResponseValidator';

export interface AllConditionResult {
  key: string;
  name: string;
  description: string;
  isBuyCondition: boolean;
  isSellCondition: boolean;
  isMet: boolean;
}

interface AllConditionsResponse {
  conditions: AllConditionResult[];
}

export default class AllConditionsService {
  /**
   * Get all available conditions with their status for given exchange and ticker
   */
  async getAllConditions(
    exchangeId: string,
    tickerId: string,
    timeframe?: string,
    session?: string
  ): Promise<AllConditionResult[]> {
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
      const response = await fetch(`/api/finance-notification/conditions/all?${params.toString()}`, {
        method: 'GET'
      });

      ResponseValidator.ValidateResponse(response);

      const result: AllConditionsResponse = await response.json();
      return result.conditions || [];
    } catch (error) {
      console.error('Failed to get all conditions:', error);
      return [];
    }
  }
}