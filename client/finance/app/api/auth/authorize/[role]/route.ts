import { NextRequest } from 'next/server';

import ErrorUtil from '@common/utils/ErrorUtil';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { ROOT_FEATURE } from '@finance/consts/FinanceConst';

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

const options: APIResponseOptions = {
  rootFeature: ROOT_FEATURE,
  feature: 'Authorize',
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ role: string }> }) {
  return APIUtil.apiHandler(async () => {
    const role = (await params).role;

    return await getAuthResult(role);
  }, options);
}
