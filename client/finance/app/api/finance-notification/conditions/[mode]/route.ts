import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import { FinanceNotificationConditionModeType } from '@finance/types/FinanceNotificationType';

import APIUtil from '@client-common/utils/APIUtil';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import { FINANCE_NOTIFICATION_CONDITION_MODE, SIMPLIFIED_CONDITION_NAME } from '@finance/consts/FinanceNotificationConst';
import ErrorUtil from '@common/utils/ErrorUtil';

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
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ mode: FinanceNotificationConditionModeType }> }) {
  if (!await AuthorizationService.authorize(Feature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const mode: FinanceNotificationConditionModeType = (await params).mode;

  try {
    const conditionList = getConditionList(mode);
    const service = new ConditionService();

    const simplifiedConditions: string[] = [];
    const nonSimplifiedConditions: string[] = [];

    // Separate conditions by enableSimplifiedMode
    conditionList.forEach(condition => {
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
        value: SIMPLIFIED_CONDITION_NAME
      });
    }

    // Add non-simplified conditions individually
    nonSimplifiedConditions.forEach(condition => {
      conditionOptionList.push({
        label: service.getConditionInfo(condition).name,
        value: condition
      });
    });

    return APIUtil.ReturnSuccess(conditionOptionList);
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
