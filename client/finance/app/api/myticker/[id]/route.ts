import { NextRequest } from 'next/server';

import MyTickerService from '@finance/services/MyTickerService';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  const service = new MyTickerService();
  const myTicker = await service.getById(id);

  if (!myTicker) {
    return APIUtil.ReturnNotFound('MyTicker not found');
  }

  return APIUtil.ReturnSuccess(myTicker);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: MyTickerDataType = await request.json();

  const service = new MyTickerService();
  const result = await service.update(id, body);

  return APIUtil.ReturnSuccess(result);
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
