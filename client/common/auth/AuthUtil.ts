import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';

import { authOptions } from '@client-common/auth/authOptions';

/**
 * @deprecated Use SessionUtil instead.
 */
export default class AuthUtil {
  /**
   * Get the current server session.
   * @returns {Promise<Session | null>} The current session or null if not authenticated.
   */
  public static async getServerSession(): Promise<Session | null> {
    return await getServerSession(authOptions);
  }

  public async getAuthenticatedApiContext() {
    const userId = await AuthUtil.getGoogleUserIdFromSession();

    if (!userId) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        userId: null,
      };
    }

    return {
      error: null,
      userId,
    };
  }

  public static async getGoogleUserIdFromSession(): Promise<string> {
    const session = await this.getServerSession();

    const accessToken = session?.tokens?.find(t => t.provider === 'google')?.accessToken;
    if (!accessToken) return '';

    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return '';

    const data = await res.json();

    return data.sub || '';
  }
}
