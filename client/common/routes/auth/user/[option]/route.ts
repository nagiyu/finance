import { NextRequest } from 'next/server';

import AuthService from '@common/services/auth/AuthService';
import { AuthDataType } from '@common/interfaces/data/AuthDataType';
import { AuthRecordType } from '@common/interfaces/record/AuthRecordType';

import AuthUtil from '@client-common/auth/AuthUtil';
import APIUtil from '@client-common/utils/APIUtil';

class SimpleAuthService extends AuthService<AuthDataType, AuthRecordType> {
  public constructor() {
    super(SimpleAuthService.dataToRecord, SimpleAuthService.recordToData);
  }

  private static dataToRecord(data: AuthDataType): AuthRecordType {
    return AuthService.dataToRecordBase(data);
  }

  private static recordToData(record: AuthRecordType): AuthDataType {
    return AuthService.recordToDataBase(record);
  }
}

async function handleGoogleOption() {
  const googleUserID = await AuthUtil.getGoogleUserIdFromSession();

  const authService = new SimpleAuthService();
  const user = await authService.getByGoogleUserId(googleUserID, true);

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
