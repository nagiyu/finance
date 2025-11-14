import { AuthDataType } from '@common/interfaces/data/AuthDataType';
import { UserType } from '@common/enums/UserType';

export interface FinanceAuthDataType extends AuthDataType {
  finance: UserType;
}
