import { NextRequest, NextResponse } from "next/server";

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import FinanceUtil from '@/utils/FinanceUtil';

export async function POST(req: NextRequest) {
  if (!await FinanceAuthorizer.isUser()) {
    return APIUtil.ReturnUnauthorized();
  }

  try {
    const { exchange, ticker } = await req.json();
    const result = await FinanceUtil.getStockPriceData(exchange, ticker);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
