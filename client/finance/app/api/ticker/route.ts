import { NextRequest } from 'next/server';

import CommonUtil from '@common/utils/CommonUtil';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import TickerDataAccessor from '@/services/ticker/TickerDataAcceesor';
import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';
import { TickerDataType } from '@/interfaces/data/TickerDataType';

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
  feature: FinanceFeature.TICKER,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function GET() {
  return await APIUtil.apiHandler(async () => {
    const tickers = await TickerDataAccessor.get();

    return tickers;
  }, getOptions(PermissionLevel.VIEW));
}

export async function POST(request: NextRequest) {
  return await APIUtil.apiHandler(async () => {
    const body: TickerDataType = await request.json();
    const now = Date.now();

    const ticker: TickerDataType = {
      ...body,
      id: CommonUtil.generateUUID(),
      create: now,
      update: now,
    };

    await TickerDataAccessor.create(ticker);

    return ticker;
  }, getOptions(PermissionLevel.EDIT));
}
