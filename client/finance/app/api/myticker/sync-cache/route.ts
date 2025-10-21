import MyTickerService from '@finance/services/MyTickerService';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

const service = new MyTickerService();

export async function POST() {
  if (!await AuthorizationService.authorize(Feature.MY_TICKER, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  await service.syncCache();

  return APIUtil.ReturnSuccess();
}
