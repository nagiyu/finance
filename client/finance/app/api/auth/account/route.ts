import { NextRequest } from 'next/server';

import { getHandler, postHandler } from '@client-common/routes/auth/account/route';

import { ROOT_FEATURE } from '@finance/consts/FinanceConst';

export async function GET() {
  return getHandler(ROOT_FEATURE);
}

export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return postHandler(ROOT_FEATURE, request as any);
}
