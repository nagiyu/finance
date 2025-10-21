import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import { TimeFrame } from '@finance/utils/FinanceUtil';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import TimeFrameUtil from '@/utils/TimeFrameUtil';

export async function GET(request: NextRequest) {
  if (!await AuthorizationService.authorize(Feature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
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
    // Get all evaluable conditions (ones that don't require target price)
    const evaluableConditionKeys = service.getEvaluableConditionList();
    const allConditionsWithStatus = [];

    // Validate and cast session to proper type
    const sessionType: ExchangeSessionType = 
      session === EXCHANGE_SESSION.EXTENDED ? EXCHANGE_SESSION.EXTENDED : EXCHANGE_SESSION.REGULAR;

    // Validate and cast timeframe to proper type
    const timeframeType: TimeFrame = 
      timeframe && TimeFrameUtil.isValidTimeFrame(timeframe) ? timeframe : TimeFrameUtil.getDefaultTimeFrame();

    for (const conditionKey of evaluableConditionKeys) {
      try {
        const conditionInfo = service.getConditionInfo(conditionKey);
        
        // Check if condition is met
        const result = await service.checkCondition(
          conditionKey,
          exchangeId,
          tickerId,
          sessionType,
          null, // no target price
          undefined, // no frequency
          timeframeType
        );

        allConditionsWithStatus.push({
          key: conditionKey,
          name: conditionInfo.name,
          description: conditionInfo.description,
          isBuyCondition: conditionInfo.isBuyCondition,
          isSellCondition: conditionInfo.isSellCondition,
          isMet: result.met
        });
      } catch (error) {
        console.warn(`Failed to check condition ${conditionKey}:`, error);
        
        // Still include the condition but mark as not met if there's an error
        const conditionInfo = service.getConditionInfo(conditionKey);
        allConditionsWithStatus.push({
          key: conditionKey,
          name: conditionInfo.name,
          description: conditionInfo.description,
          isBuyCondition: conditionInfo.isBuyCondition,
          isSellCondition: conditionInfo.isSellCondition,
          isMet: false
        });
      }
    }

    return APIUtil.ReturnSuccess({ conditions: allConditionsWithStatus });
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}