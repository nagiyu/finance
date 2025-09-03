import { NextRequest } from 'next/server';

import MyTickerService from '@finance/services/MyTickerService';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: MyTickerDataType = await request.json();
  const now = Date.now();

  const requestData: MyTickerDataType = {
    ...body,
    id,
    update: now,
  };

  const service = new MyTickerService();
  await service.update(requestData);

  return APIUtil.ReturnSuccess(requestData);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  const service = new MyTickerService();
  await service.delete(id);

  return APIUtil.ReturnSuccess();
}
