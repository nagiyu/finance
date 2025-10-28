import { NextRequest } from 'next/server';

import { putHandler } from '@client-common/routes/auth/account/[id]/route';

import { ROOT_FEATURE } from '@finance/consts/FinanceConst';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return putHandler(ROOT_FEATURE, request as any, { params });
}
