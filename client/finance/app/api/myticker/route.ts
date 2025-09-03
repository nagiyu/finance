import { NextRequest } from 'next/server';

import CommonUtil from '@common/utils/CommonUtil';

import MyTickerService from '@finance/services/MyTickerService';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';

export async function GET() {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const service = new MyTickerService();
  const myTickers = await service.get();

  return APIUtil.ReturnSuccess(myTickers);
}

export async function POST(request: NextRequest) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: MyTickerDataType = await request.json();
  const now = Date.now();

  const requestData: MyTickerDataType = {
    ...body,
    id: CommonUtil.generateUUID(),
    create: now,
    update: now,
  };

  const service = new MyTickerService();
  await service.create(requestData);

  return APIUtil.ReturnSuccess(requestData);
}
