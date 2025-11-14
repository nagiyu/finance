import { NextRequest } from 'next/server';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import MyTickerService from '@finance/services/MyTickerService';
import MyTickerValidator from '@finance/utils/MyTickerValidator';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';
import { BadRequestError } from '@common/errors';

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

export async function GET() {
  return await APIUtil.apiHandler(async () => {
    const service = new MyTickerService();
    const myTickers = await service.get();

    return myTickers;
  }, getOptions(PermissionLevel.VIEW));
}

export async function POST(request: NextRequest) {
  return await APIUtil.apiHandler(async () => {
    const body: MyTickerDataType = await request.json();

    try {
      MyTickerValidator.validate(body);
    } catch (error) {
      throw new BadRequestError(error instanceof Error ? error.message : 'Validation failed');
    }

    const service = new MyTickerService();
    const result = await service.create(body);

    return result;
  }, getOptions(PermissionLevel.EDIT));
}
