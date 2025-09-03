import { NextRequest } from "next/server";

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import { ExchangeDataType } from "@/interfaces/data/ExchangeDataType";

import ExchangeUtil from '@/utils/ExchangeUtil';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await FinanceAuthorizer.isAdmin()) {
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
  if (!await FinanceAuthorizer.isAdmin()) {
    return APIUtil.ReturnUnauthorized();
  }

  const id = (await params).id;

  await ExchangeUtil.Delete(id);

  return APIUtil.ReturnSuccess();
}
