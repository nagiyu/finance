import { NextRequest } from 'next/server';

import CommonUtil from '@common/utils/CommonUtil';
import SimpleAuthService from '@common/services/auth/SimpleAuthService';
import { AuthDataType } from '@common/interfaces/data/AuthDataType';

import APIUtil from '@client-common/utils/APIUtil';
import AuthUtil from '@client-common/auth/AuthUtil';

export async function GET() {
  const service = new SimpleAuthService();
  const googleUserID = await AuthUtil.getGoogleUserIdFromSession();

  if (!googleUserID) {
    return APIUtil.ReturnUnauthorized();
  }

  const user = await service.getByGoogleUserId(googleUserID);

  return APIUtil.ReturnSuccess(user ? [user] : []);
}

export async function POST(request: NextRequest) {
  const googleUserID = await AuthUtil.getGoogleUserIdFromSession();

  if (!googleUserID) {
    return APIUtil.ReturnUnauthorized();
  }

  const body: AuthDataType = await request.json();
  const now = Date.now();

  const requestData: AuthDataType = {
    ...body,
    id: CommonUtil.generateUUID(),
    googleUserId: googleUserID,
    create: now,
    update: now,
  };

  const service = new SimpleAuthService();
  await service.create(requestData);

  return APIUtil.ReturnSuccess(requestData);
}
