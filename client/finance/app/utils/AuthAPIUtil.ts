import { signOut } from 'next-auth/react';

import ResponseValidator from '@client-common/utils/ResponseValidator';

import { AuthResultType } from '@/interfaces/data/AuthResultType';

export default class AuthAPIUtil {
  public static async isAuthorized(role: string): Promise<boolean> {
    const response = await fetch(`/api/auth/authorize/${role}`, {
      method: 'GET',
      cache: 'no-store'
    });

    // Handle 401 Unauthorized by signing out
    if (response.status === 401) {
      await signOut({ callbackUrl: '/' });
      return false;
    }

    ResponseValidator.ValidateResponse(response);

    const result: AuthResultType = await response.json();

    return result.isAuthorized;
  }
}
