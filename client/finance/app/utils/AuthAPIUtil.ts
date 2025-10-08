import { signOut } from 'next-auth/react';

import { AuthResultType } from '@/interfaces/data/AuthResultType';

export default class AuthAPIUtil {
  public static async isAuthorized(role: string): Promise<boolean> {
    const response = await fetch(`/api/auth/authorize/${role}`, {
      method: 'GET'
    });

    // Handle 401 Unauthorized by signing out
    if (response.status === 401) {
      await signOut({ callbackUrl: '/' });
      return false;
    }

    // For other error status codes, throw an error
    if (!response.ok) {
      throw new Error(`Authorization check failed with status ${response.status}`);
    }

    const result: AuthResultType = await response.json();

    return result.isAuthorized;
  }
}
