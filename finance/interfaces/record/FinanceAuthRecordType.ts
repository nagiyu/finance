import { AuthRecordType } from '@common/interfaces/record/AuthRecordType';
import { UserType } from '@common/enums/UserType';

export interface FinanceAuthRecordType extends AuthRecordType {
  Finance: UserType;
}
