import { NextRequest } from "next/server";

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';
import TickerDataAccessor from "@/services/ticker/TickerDataAcceesor";
import { TickerDataType } from "@/interfaces/data/TickerDataType";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await AuthorizationService.authorize(FinanceFeature.TICKER, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: TickerDataType = await request.json();
  const now = Date.now();

  const ticker: TickerDataType = {
    ...body,
    id,
    update: now
  };

  try {
    await TickerDataAccessor.update(ticker);
  } catch (error) {
    console.error(error);
    return APIUtil.ReturnBadRequest(JSON.stringify(error));
  }

  return APIUtil.ReturnSuccessWithObject(ticker);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await AuthorizationService.authorize(FinanceFeature.TICKER, PermissionLevel.DELETE)) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  await TickerDataAccessor.delete(id);

  return APIUtil.ReturnSuccess();
}
