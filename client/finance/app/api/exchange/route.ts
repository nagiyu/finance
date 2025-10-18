import { NextRequest } from "next/server";

import CommonUtil from "@common/utils/CommonUtil";

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

import ExchangeUtil from '@/utils/ExchangeUtil';

export async function GET() {
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  const exchanges = await ExchangeUtil.GetAll();

  return APIUtil.ReturnSuccessWithObject(exchanges);
}

export async function POST(request: NextRequest) {
  if (!await AuthorizationService.authorize(Feature.EXCHANGE, PermissionLevel.EDIT)) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: ExchangeDataType = await request.json();
  const now = Date.now();

  const exchange: ExchangeDataType = {
    ...body,
    id: CommonUtil.generateUUID(),
    create: now,
    update: now,
  };

  await ExchangeUtil.Create(exchange);

  return APIUtil.ReturnSuccessWithObject(exchange);
}
