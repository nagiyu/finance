import { NextRequest } from 'next/server';

import ErrorUtil from '@common/utils/ErrorUtil';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import ConditionService from '@finance/services/ConditionService';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { FinanceNotificationConditionModeType } from '@finance/types/FinanceNotificationType';
import {
  FINANCE_NOTIFICATION_CONDITION_MODE,
  SIMPLIFIED_CONDITION_NAME,
} from '@finance/consts/FinanceNotificationConst';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

const getConditionList = (mode: FinanceNotificationConditionModeType): string[] => {
  const service = new ConditionService();

  switch (mode) {
    case FINANCE_NOTIFICATION_CONDITION_MODE.BUY:
      return service.getBuyConditionList();

    case FINANCE_NOTIFICATION_CONDITION_MODE.SELL:
      return service.getSellConditionList();

    default:
      ErrorUtil.throwError(`Invalid mode: ${mode}`);
  }
};

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

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ mode: FinanceNotificationConditionModeType }> }
) {
  return await APIUtil.apiHandler(async () => {
    const mode: FinanceNotificationConditionModeType = (await params).mode;

    const conditionList = getConditionList(mode);
    const service = new ConditionService();

    const simplifiedConditions: string[] = [];
    const nonSimplifiedConditions: string[] = [];

    // Separate conditions by enableSimplifiedMode
    conditionList.forEach((condition) => {
      const info = service.getConditionInfo(condition);
      if (info.enableSimplifiedMode) {
        simplifiedConditions.push(condition);
      } else {
        nonSimplifiedConditions.push(condition);
      }
    });

    const conditionOptionList: SelectOptionType[] = [];

    // Add simplified group option if there are any simplified conditions
    if (simplifiedConditions.length > 0) {
      const modeLabel = mode === FINANCE_NOTIFICATION_CONDITION_MODE.BUY ? '買い' : '売り';
      conditionOptionList.push({
        label: `簡易設定 (全${modeLabel}パターン)`,
        value: SIMPLIFIED_CONDITION_NAME,
      });
    }

    // Add non-simplified conditions individually
    nonSimplifiedConditions.forEach((condition) => {
      conditionOptionList.push({
        label: service.getConditionInfo(condition).name,
        value: condition,
      });
    });

    return conditionOptionList;
  }, getOptions(PermissionLevel.VIEW));
}
