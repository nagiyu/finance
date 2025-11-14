import { NextRequest } from "next/server";

import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import TickerDataAccessor from "@/services/ticker/TickerDataAcceesor";
import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';
import { TickerDataType } from "@/interfaces/data/TickerDataType";

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const body: TickerDataType = await request.json();
    const now = Date.now();

    const ticker: TickerDataType = {
      ...body,
      id,
      update: now
    };

    await TickerDataAccessor.update(ticker);

    return ticker;
  }, getOptions(PermissionLevel.EDIT));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;

    await TickerDataAccessor.delete(id);
  }, getOptions(PermissionLevel.DELETE));
}
