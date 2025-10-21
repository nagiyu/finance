import { NextRequest } from 'next/server';

import MyTickerService from '@finance/services/MyTickerService';
import { MyTickerDataType } from '@finance/interfaces/data/MyTickerDataType';
import MyTickerValidator from '@finance/utils/MyTickerValidator';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

export async function GET() {
  if (!await AuthorizationService.authorize(Feature.MY_TICKER, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const service = new MyTickerService();
  const myTickers = await service.get();

  return APIUtil.ReturnSuccess(myTickers);
}

export async function POST(request: NextRequest) {
  if (!await AuthorizationService.authorize(Feature.MY_TICKER, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: MyTickerDataType = await request.json();

  try {
    MyTickerValidator.validate(body);
  } catch (error) {
    return APIUtil.ReturnBadRequest(error instanceof Error ? error.message : 'Validation failed');
  }

  const service = new MyTickerService();
  const result = await service.create(body);

  return APIUtil.ReturnSuccess(result);
}
