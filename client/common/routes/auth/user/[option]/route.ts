import { NextRequest } from 'next/server';

import SimpleAuthService from '@common/services/auth/SimpleAuthService';

import AuthUtil from '@client-common/auth/AuthUtil';
import APIUtil from '@client-common/utils/APIUtil';

async function handleGoogleOption() {
  const googleUserID = await AuthUtil.getGoogleUserIdFromSession();

  const authService = new SimpleAuthService();
  const user = await authService.getByGoogleUserId(googleUserID);

  if (!user) {
    return APIUtil.ReturnNotFound('User not found');
  }

  return APIUtil.ReturnSuccess(user);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ option: string }> }) {
  const option = (await params).option;

  if (!option) {
    return APIUtil.ReturnBadRequest('Option is required');
  }

  switch (option) {
    case 'google':
      return handleGoogleOption();

    default:
      return APIUtil.ReturnBadRequest('Invalid option');
  }
}
