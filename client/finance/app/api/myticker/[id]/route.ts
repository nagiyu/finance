import { NextRequest } from 'next/server';

import { BadRequestError, NotFoundError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import MyTickerService from '@finance/services/MyTickerService';
import MyTickerValidator from '@finance/utils/MyTickerValidator';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

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
  feature: FinanceFeature.MY_TICKER,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;

    const service = new MyTickerService();
    const myTicker = await service.getById(id);

    if (!myTicker) {
      throw new NotFoundError('MyTicker not found');
    }

    return myTicker;
  }, getOptions(PermissionLevel.VIEW));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const body: MyTickerDataType = await request.json();

    try {
      MyTickerValidator.validate(body);
    } catch (error) {
      throw new BadRequestError(error instanceof Error ? error.message : 'Validation failed');
    }

    const service = new MyTickerService();
    const result = await service.update(id, body);

    return result;
  }, getOptions(PermissionLevel.EDIT));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;

    const service = new MyTickerService();
    await service.delete(id);
  }, getOptions(PermissionLevel.DELETE));
}
