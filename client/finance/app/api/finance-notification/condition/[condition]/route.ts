import { NextRequest } from 'next/server';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import ConditionService from '@finance/services/ConditionService';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { SIMPLIFIED_CONDITION_NAME } from '@finance/consts/FinanceNotificationConst';

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

export async function GET(_: NextRequest, { params }: { params: Promise<{ condition: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const condition: string = (await params).condition;

    const service = new ConditionService();

    // Handle simplified mode specially
    if (condition === SIMPLIFIED_CONDITION_NAME) {
      const simplifiedConditionInfo = {
        name: '簡易設定',
        description:
          '買い・売りモードに応じた全てのパターン条件を一括で設定します。個別の価格条件（指定価格を上回る・下回る）は含まれません。',
        isBuyCondition: true,
        isSellCondition: true,
        enableTargetPrice: false,
        enableTimeFrame: true,
        enableSimplifiedMode: true,
      };
      return simplifiedConditionInfo;
    }

    const conditionInfo = service.getConditionInfo(condition);

    return conditionInfo;
  }, getOptions(PermissionLevel.VIEW));
}
