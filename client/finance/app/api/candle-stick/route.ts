import { NextRequest, NextResponse } from "next/server";

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { FinanceFeature } from '@finance/consts/FinanceConst';
import FinanceUtil, { GetStockPriceDataOptions } from '@finance/utils/FinanceUtil';

interface CandleStickRequest {
  exchange: string;
  ticker: string;
  options?: GetStockPriceDataOptions;
}

export async function POST(req: NextRequest) {
  if (!await AuthorizationService.authorize(FinanceFeature.STOCK_CHART, PermissionLevel.VIEW)) {
    return APIUtil.ReturnUnauthorized();
  }

  try {
    const { exchange, ticker, options }: CandleStickRequest = await req.json();
    
    const result = await FinanceUtil.getStockPriceData(exchange, ticker, options);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
