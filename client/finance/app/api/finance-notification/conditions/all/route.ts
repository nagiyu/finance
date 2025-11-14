import { NextRequest } from 'next/server';

import { BadRequestError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import ConditionService from '@finance/services/ConditionService';
import { ExchangeSessionType } from '@finance/types/ExchangeTypes';
import { EXCHANGE_SESSION } from '@finance/consts/ExchangeConsts';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { TimeFrame } from '@finance/utils/FinanceUtil';

import TimeFrameUtil from '@/utils/TimeFrameUtil';
import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

/**
 * 認可サービスのインスタンス
 */
const authorizationService = new FinanceAuthorizationService();

/**
 * APIレスポンスオプションを取得
 * @param level 必要な権限レベル
 * @returns APIレスポンスオプション
 */
const getOptions = (level: PermissionLevel): APIResponseOptions => ({
  rootFeature: ROOT_FEATURE,
  feature: FinanceFeature.FINANCE_NOTIFICATION,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function GET(request: NextRequest) {
  return await APIUtil.apiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const exchangeId = searchParams.get('exchangeId');
    const tickerId = searchParams.get('tickerId');
    const timeframe = searchParams.get('timeframe');
    const session = searchParams.get('session');

    if (!exchangeId || !tickerId) {
      throw new BadRequestError('exchangeId and tickerId are required');
    }

    const service = new ConditionService();

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

    return { conditions: allConditionsWithStatus };
  }, getOptions(PermissionLevel.VIEW));
}