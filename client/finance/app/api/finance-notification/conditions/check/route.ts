import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import { TimeFrame } from '@finance/utils/FinanceUtil';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import TimeFrameUtil from '@/utils/TimeFrameUtil';

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

    // Validate and cast session to proper type
    const sessionType: ExchangeSessionType = 
      session === EXCHANGE_SESSION.EXTENDED ? EXCHANGE_SESSION.EXTENDED : EXCHANGE_SESSION.REGULAR;

    // Validate and cast timeframe to proper type
    const timeframeType: TimeFrame = 
      timeframe && TimeFrameUtil.isValidTimeFrame(timeframe) ? timeframe : TimeFrameUtil.getDefaultTimeFrame();

    for (const conditionName of evaluableConditions) {
      try {
        const result = await service.checkCondition(
          conditionName,
          exchangeId,
          tickerId,
          sessionType,
          null, // no target price
          undefined, // no frequency
          timeframeType
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