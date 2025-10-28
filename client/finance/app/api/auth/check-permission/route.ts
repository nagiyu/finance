import { NextRequest } from 'next/server';

import { BadRequestError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { ROOT_FEATURE, FinanceFeature } from '@finance/consts/FinanceConst';

import AuthorizationService from '@/services/auth/AuthorizationService';

/**
 * 権限チェックAPIのリクエスト型
 */
export interface CheckPermissionRequestType {
  feature: FinanceFeature;
  level: PermissionLevel;
}

/**
 * 権限チェックAPIのレスポンス型
 */
export interface CheckPermissionResponseType {
  hasPermission: boolean;
}

// Disable caching for this route to ensure fresh permission checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const options: APIResponseOptions = {
  rootFeature: ROOT_FEATURE,
  feature: 'CheckPermission'
};

/**
 * 権限チェックAPI
 * クライアントから指定された機能と権限レベルに対する権限を確認
 */
export async function POST(request: NextRequest) {
  return APIUtil.apiHandler(async () => {
    const body: CheckPermissionRequestType = await request.json();
    const { feature, level } = body;

    // 入力検証
    if (!feature || !Object.values(FinanceFeature).includes(feature as FinanceFeature)) {
      throw new BadRequestError('Invalid feature');
    }

    if (!level || !Object.values(PermissionLevel).includes(level as PermissionLevel)) {
      throw new BadRequestError('Invalid permission level');
    }

    // 権限チェック
    const hasPermission = await AuthorizationService.authorize(
      feature,
      level
    );

    const response: CheckPermissionResponseType = { hasPermission };

    return response;
  }, options);
}
