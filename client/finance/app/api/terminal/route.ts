import { getHandler } from '@client-common/routes/terminal/route';

import { ROOT_FEATURE } from '@finance/consts/FinanceConst';

export async function GET() {
  return getHandler(ROOT_FEATURE);
}
