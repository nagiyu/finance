import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import { FinanceNotificationConditionModeType } from '@finance/types/FinanceNotificationType';

import APIUtil from '@client-common/utils/APIUtil';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import { FINANCE_NOTIFICATION_CONDITION_MODE } from '@finance/consts/FinanceNotificationConst';
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
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const mode: FinanceNotificationConditionModeType = (await params).mode;

  try {
    const conditionList = getConditionList(mode);

    const conditionOptionList: SelectOptionType[] = conditionList.map(condition => {
      const service = new ConditionService();
      return {
        label: service.getConditionInfo(condition).name,
        value: condition
      }
    });

    return APIUtil.ReturnSuccess(conditionOptionList);
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
