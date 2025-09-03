import { AuthRecordType } from '@common/interfaces/record/AuthRecordType';

import { FinanceRole } from '@/consts/FinanceRole';

export interface FinanceAuthRecordType extends AuthRecordType {
  Finance: FinanceRole;
}
