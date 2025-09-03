import ResponseValidator from '@client-common/utils/ResponseValidator';

import { AuthResultType } from '@/interfaces/data/AuthResultType';

export default class AuthAPIUtil {
  public static async isAuthorized(role: string): Promise<boolean> {
    const response = await fetch(`/api/auth/authorize/${role}`, {
      method: 'GET'
    });

    ResponseValidator.ValidateResponse(response);

    const result: AuthResultType = await response.json();

    return result.isAuthorized;
  }
}
