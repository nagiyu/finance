import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET(request: NextRequest) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const exchangeId = searchParams.get('exchangeId');
  const tickerId = searchParams.get('tickerId');
  const timeframe = searchParams.get('timeframe');
  const session = searchParams.get('session');

  if (!exchangeId || !tickerId) {
    return APIUtil.ReturnBadRequest('exchangeId and tickerId are required');
  }

  const service = new ConditionService();

  try {
    // Get conditions that don't require target price
    const evaluableConditions = service.getEvaluableConditionList();
    const applicableConditions = [];

    for (const conditionName of evaluableConditions) {
      try {
        const result = await service.checkCondition(
          conditionName,
          exchangeId,
          tickerId,
          session || 'regular',
          null, // no target price
          undefined, // no frequency
          timeframe || '1'
        );

        if (result.met) {
          const conditionInfo = service.getConditionInfo(conditionName);
          applicableConditions.push({
            name: conditionInfo.name,
            key: conditionName,
            isBuyCondition: conditionInfo.isBuyCondition,
            isSellCondition: conditionInfo.isSellCondition
          });
        }
      } catch (error) {
        console.warn(`Failed to check condition ${conditionName}:`, error);
        // Continue with other conditions even if one fails
      }
    }

    return APIUtil.ReturnSuccess({ conditions: applicableConditions });
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}