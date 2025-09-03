import ErrorUtil from '@common/utils/ErrorUtil';
import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

export default class AccountFetchService extends FetchServiceBase<AuthDataType> {
  public constructor() {
    super('/api/auth/account');
  }

  public override async delete(_: string): Promise<void> {
    ErrorUtil.throwError('Method not implemented.');
  }
}
