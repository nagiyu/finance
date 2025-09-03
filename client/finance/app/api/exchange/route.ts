import { NextRequest } from "next/server";

import CommonUtil from "@common/utils/CommonUtil";

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

import ExchangeUtil from '@/utils/ExchangeUtil';

export async function GET() {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  const exchanges = await ExchangeUtil.GetAll();

  return APIUtil.ReturnSuccessWithObject(exchanges);
}

export async function POST(request: NextRequest) {
  if (!await FinanceAuthorizer.isAdmin()) {
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
