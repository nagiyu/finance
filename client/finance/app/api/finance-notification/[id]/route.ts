import { NextRequest } from 'next/server';

import ConditionService from '@finance/services/ConditionService';
import ExchangeService from '@finance/services/ExchangeService';
import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import NotificationService from '@common/services/NotificationService';
import TickerService from '@finance/services/TickerService';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const result = await service.getById(id);

  if (!result) {
    return APIUtil.ReturnNotFound();
  }

  return APIUtil.ReturnSuccess(result);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: FinanceNotificationDataType = await request.json();

  const result = await service.update(id, body);

  return APIUtil.ReturnSuccess(result);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  await service.delete(id);

  return APIUtil.ReturnSuccess();
}
