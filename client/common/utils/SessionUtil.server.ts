import { getServerSession, Session } from 'next-auth';

import { authOptions } from '@client-common/auth/authOptions';

export default class SessionUtil {
  public static async getSession(): Promise<Session | null> {
    const session = await getServerSession(authOptions);

    if (!session) {
      return null;
    }

    if (!(await this.hasGoogleSession(session))) {
      return null;
    }

    return session;
  }

  public static async hasSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  public static async getGoogleUserIdFromSession(session: Session): Promise<string | null> {
    const accessToken = session.tokens?.find(t => t.provider === 'google')?.accessToken;
    if (!accessToken) return null;

    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;

    const data = await res.json();

    return data.sub || null;
  }

  private static async hasGoogleSession(session: Session): Promise<boolean> {
    const userId = await this.getGoogleUserIdFromSession(session);
    return userId !== null;
  }
}
