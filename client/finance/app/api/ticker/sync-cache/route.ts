import TickerService from '@finance/services/TickerService';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

const service = new TickerService();

export async function POST() {
  if (!await AuthorizationService.authorize(Feature.TICKER, PermissionLevel.ADMIN)) {
    return APIUtil.ReturnUnauthorized();
  }

  await service.syncCache();

  return APIUtil.ReturnSuccess();
}
