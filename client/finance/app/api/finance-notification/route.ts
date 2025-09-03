import { NextRequest } from 'next/server';

import CommonUtil from '@common/utils/CommonUtil';

import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET() {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const service = new FinanceNotificationService();
  const notifications = await service.get();

  return APIUtil.ReturnSuccess(notifications);
}

export async function POST(request: NextRequest) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: FinanceNotificationDataType = await request.json();
  const now = Date.now();

  const requestData: FinanceNotificationDataType = {
    ...body,
    id: CommonUtil.generateUUID(),
    create: now,
    update: now,
  };

  const service = new FinanceNotificationService();
  await service.create(requestData);

  return APIUtil.ReturnSuccess(requestData);
}
