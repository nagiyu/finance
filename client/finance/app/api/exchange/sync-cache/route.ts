import ExchangeService from '@finance/services/ExchangeService';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';

const service = new ExchangeService();

export async function POST() {
  if (!await AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  await service.syncCache();

  return APIUtil.ReturnSuccess();
}
