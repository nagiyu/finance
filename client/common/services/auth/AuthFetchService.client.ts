import ErrorUtil from '@common/utils/ErrorUtil';
import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import FetchServiceBase from '@client-common/services/FetchServiceBase.client';

export default class AuthFetchService extends FetchServiceBase<AuthDataType> {
  public constructor() {
    super('/api/auth/user');
  }

  public async getUserByGoogle(): Promise<AuthDataType> {
    const response = await fetch(`${this.endpoint}/google`, {
      method: 'GET'
    });

    this.validateResponse(response);

    return await response.json();
  }

  public override async get(): Promise<AuthDataType[]> {
    ErrorUtil.throwError('Method not implemented.');
  }

  public override async create(_: AuthDataType): Promise<AuthDataType> {
    ErrorUtil.throwError('Method not implemented.');
  }

  public override async update(_: AuthDataType): Promise<AuthDataType> {
    ErrorUtil.throwError('Method not implemented.');
  }

  public override async delete(_: string): Promise<void> {
    ErrorUtil.throwError('Method not implemented.');
  }
}
