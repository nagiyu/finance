import { NextRequest } from 'next/server';

import FinanceNotificationService from '@finance/services/FinanceNotificationService';
import { FinanceNotificationDataType } from '@finance/interfaces/data/FinanceNotificationDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: FinanceNotificationDataType = await request.json();
  const now = Date.now();

  const requestData: FinanceNotificationDataType = {
    ...body,
    id,
    update: now,
  };

  const service = new FinanceNotificationService();
  await service.update(requestData);

  return APIUtil.ReturnSuccess(requestData);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  const service = new FinanceNotificationService();
  await service.delete(id);

  return APIUtil.ReturnSuccess();
}
