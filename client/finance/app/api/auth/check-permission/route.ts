import { NextRequest } from 'next/server';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';
import {
  CheckPermissionRequestType,
  CheckPermissionResponseType,
} from './types';

/**
 * 権限チェックAPI
 * クライアントから指定された機能と権限レベルに対する権限を確認
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckPermissionRequestType = await request.json();
    const { feature, level } = body;

    // 入力検証
    if (!feature || !Object.values(Feature).includes(feature as Feature)) {
      return APIUtil.ReturnBadRequest('Invalid feature');
    }

    if (!level || !Object.values(PermissionLevel).includes(level as PermissionLevel)) {
      return APIUtil.ReturnBadRequest('Invalid permission level');
    }

    // 権限チェック
    const hasPermission = await AuthorizationService.authorize(
      feature,
      level
    );

    const response: CheckPermissionResponseType = { hasPermission };
    return APIUtil.ReturnSuccessWithObject(response);
  } catch (error) {
    console.error('Error in check-permission API:', error);
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
