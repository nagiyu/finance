import ExchangeService from '@finance/services/ExchangeService';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

const service = new ExchangeService();

export async function POST() {
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.ADMIN)) {
    return APIUtil.ReturnUnauthorized();
  }

  await service.syncCache();

  return APIUtil.ReturnSuccess();
}
