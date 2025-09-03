import { NextRequest } from 'next/server';

import ErrorUtil from '@common/utils/ErrorUtil';

import APIUtil from '@client-common/utils/APIUtil';

import FinanceAuthorizer from '@/services/finance/FinanceAuthorizer';
import { AuthResultType } from '@/interfaces/data/AuthResultType';

const getAuthResult = async (role: string): Promise<AuthResultType> => {
  switch (role) {
    case 'admin':
      return {
        isAuthorized: await FinanceAuthorizer.isAdmin()
      };

    case 'user':
      return {
        isAuthorized: await FinanceAuthorizer.isUser()
      };

    default:
      ErrorUtil.throwError(`Invalid role: ${role}`);
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ role: string }> }) {
  const role = (await params).role;

  const result = await getAuthResult(role);

  return APIUtil.ReturnSuccessWithObject(result);
}
