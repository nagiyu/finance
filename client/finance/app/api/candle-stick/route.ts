import { NextRequest } from 'next/server';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import FinanceUtil, { GetStockPriceDataOptions } from '@finance/utils/FinanceUtil';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

/**
 * ローソク足データ取得APIのリクエストインターフェース
 */
interface CandleStickRequest {
  /**
   * Exchange
   */
  exchange: string;

  /**
   * Ticker
   */
  ticker: string;

  /**
   * オプション
   */
  options?: GetStockPriceDataOptions;
}

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
  feature: FinanceFeature.STOCK_CHART,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function POST(req: NextRequest) {
  return await APIUtil.apiHandler(async () => {
    const { exchange, ticker, options }: CandleStickRequest = await req.json();

    const result = await FinanceUtil.getStockPriceData(exchange, ticker, options);

    return result;
  }, getOptions(PermissionLevel.VIEW));
}
