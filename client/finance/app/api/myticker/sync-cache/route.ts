import MyTickerService from '@finance/services/MyTickerService';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

const service = new MyTickerService();

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
  feature: FinanceFeature.MY_TICKER,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function POST() {
  return await APIUtil.apiHandler(async () => {
    await service.syncCache();
  }, getOptions(PermissionLevel.VIEW));
}
