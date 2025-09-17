import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET(_: NextRequest, { params }: { params: Promise<{ condition: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const condition: string = (await params).condition;

  const service = new ConditionService();

  try {
    const conditionInfo = service.getConditionInfo(condition);

    return APIUtil.ReturnSuccess(conditionInfo);
  } catch (error) {
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
