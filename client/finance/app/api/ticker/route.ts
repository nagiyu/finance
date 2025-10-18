import { NextRequest } from "next/server";

import CommonUtil from "@common/utils/CommonUtil";

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import TickerDataAccessor from "@/services/ticker/TickerDataAcceesor";
import { TickerDataType } from "@/interfaces/data/TickerDataType";

export async function GET() {
  if (!await AuthorizationService.authorize(Feature.TICKER, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const tickers = await TickerDataAccessor.get();

  return APIUtil.ReturnSuccessWithObject(tickers);
}

export async function POST(request: NextRequest) {
  if (!await AuthorizationService.authorize(Feature.TICKER, PermissionLevel.ADMIN)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: TickerDataType = await request.json();
  const now = Date.now();

  const ticker: TickerDataType = {
    ...body,
    id: CommonUtil.generateUUID(),
    create: now,
    update: now,
  }

  await TickerDataAccessor.create(ticker);

  return APIUtil.ReturnSuccessWithObject(ticker);
}
