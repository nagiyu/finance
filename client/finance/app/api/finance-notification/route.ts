import { NextRequest } from 'next/server';

import NotificationService from '@common/services/NotificationService';

import ConditionService from '@finance/services/ConditionService';
import ExchangeService from '@finance/services/ExchangeService';
import FinanceNotificationDataAccessor from '@finance/services/FinanceNotificationDataAccessor';
import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import TickerService from '@finance/services/TickerService';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

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

export async function GET() {
  if (!await AuthorizationService.authorize(Feature.FINANCE_NOTIFICATION, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const notifications = await service.get();

  return APIUtil.ReturnSuccess(notifications);
}

export async function POST(request: NextRequest) {
  if (!await AuthorizationService.authorize(Feature.FINANCE_NOTIFICATION, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: FinanceNotificationDataType = await request.json();

  const result = await service.create(body);

  return APIUtil.ReturnSuccess(result);
}
