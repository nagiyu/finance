import { postHandler } from '@client-common/routes/auth/check-permission/route';

import { ROOT_FEATURE } from '@finance/consts/FinanceConst';

import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

const authorizationService = new FinanceAuthorizationService();

/**
 * 権限チェックAPI
 * クライアントから指定された機能と権限レベルに対する権限を確認
 */
export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return postHandler(ROOT_FEATURE, request as any, authorizationService);
}
