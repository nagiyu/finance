import { NextRequest } from 'next/server';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import ExchangeUtil from '@/utils/ExchangeUtil';
import { ExchangeDataType } from '@/interfaces/data/ExchangeDataType';
import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

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
  feature: FinanceFeature.EXCHANGE,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const body: ExchangeDataType = await request.json();
    const now = Date.now();

    const exchange: ExchangeDataType = {
      ...body,
      id,
      update: now,
    };

    await ExchangeUtil.Update(exchange);

    return exchange;
  }, getOptions(PermissionLevel.EDIT));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;

    await ExchangeUtil.Delete(id);
  }, getOptions(PermissionLevel.DELETE));
}
