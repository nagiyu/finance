import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import { FinanceRole } from '@/consts/FinanceRole';

export interface FinanceAuthDataType extends AuthDataType {
  finance: FinanceRole;
}
