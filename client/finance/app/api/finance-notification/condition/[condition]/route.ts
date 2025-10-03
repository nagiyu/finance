import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import { SIMPLIFIED_CONDITION_NAME } from '@finance/consts/FinanceNotificationConst';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET(_: NextRequest, { params }: { params: Promise<{ condition: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const condition: string = (await params).condition;

  const service = new ConditionService();

  try {
    // Handle simplified mode specially
    if (condition === SIMPLIFIED_CONDITION_NAME) {
      const simplifiedConditionInfo = {
        name: SIMPLIFIED_CONDITION_NAME,
        description: '買い・売りモードに応じた全てのパターン条件を一括で設定します。個別の価格条件（指定価格を上回る・下回る）は含まれません。',
        isBuyCondition: true,
        isSellCondition: true,
        enableTargetPrice: false,
        enableTimeFrame: true,
        enableSimplifiedMode: true,
      };
      return APIUtil.ReturnSuccess(simplifiedConditionInfo);
    }

    const conditionInfo = service.getConditionInfo(condition);

    return APIUtil.ReturnSuccess(conditionInfo);
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
