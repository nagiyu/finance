import { NextRequest } from "next/server";

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

import ExchangeUtil from '@/utils/ExchangeUtil';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;
  const body: ExchangeDataType = await request.json();
  const now = Date.now();

  const exchange: ExchangeDataType = {
    ...body,
    id,
    update: now,
  };

  try {
    await ExchangeUtil.Update(exchange);
  } catch (error) {
    console.error(error);
    return APIUtil.ReturnBadRequest(JSON.stringify(error));
  }

  return APIUtil.ReturnSuccessWithObject(exchange);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await AuthorizationService.authorize(FinanceFeature.EXCHANGE, PermissionLevel.DELETE)) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  await ExchangeUtil.Delete(id);

  return APIUtil.ReturnSuccess();
}
