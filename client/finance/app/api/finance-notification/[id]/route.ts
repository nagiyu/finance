import { NextRequest } from 'next/server';

import NotificationService from '@common/services/NotificationService';
import { NotFoundError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import ConditionService from '@finance/services/ConditionService';
import ExchangeService from '@finance/services/ExchangeService';
import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import TickerService from '@finance/services/TickerService';
import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

const dataAccessor = new FinanceNotificationDataAccessor();
const exchangeService = new ExchangeService();
const tickerService = new TickerService();
const conditionService = new ConditionService();
const notificationService = new NotificationService();

const service = new FinanceNotificationService(
  dataAccessor,
  exchangeService,
  tickerService,
  conditionService,
  notificationService
);

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
  feature: FinanceFeature.FINANCE_NOTIFICATION,
  authorization: {
    authorizationService: authorizationService,
    requiredLevel: level,
  },
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const result = await service.getById(id);

    if (!result) {
      throw new NotFoundError('Finance notification not found');
    }

    return result;
  }, getOptions(PermissionLevel.VIEW));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;
    const body: FinanceNotificationDataType = await request.json();

    const result = await service.update(id, body);

    return result;
  }, getOptions(PermissionLevel.EDIT));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await APIUtil.apiHandler(async () => {
    const id = (await params).id;

    await service.delete(id);
  }, getOptions(PermissionLevel.DELETE));
}
