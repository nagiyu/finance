import { NextRequest } from 'next/server';

import { BadRequestError, UnauthorizedError } from '@common/errors';
import { PermissionLevel } from '@common/enums/PermissionLevel';
import { PermissionMatrix } from '@common/interfaces/authorization/PermissionMatrix';

import APIUtil, { APIResponseOptions } from '@client-common/utils/APIUtil';

import { FinanceFeature, ROOT_FEATURE } from '@finance/consts/FinanceConst';

import PermissionMatrixService from '@/services/auth/PermissionMatrixService';
import { FinanceAuthorizationService } from '@/services/auth/FinanceAuthorizationService';

/**
 * 権限マトリックス更新APIのリクエスト型
 */
export interface PermissionMatrixUpdateRequestType {
  matrix: PermissionMatrix<FinanceFeature>;
}

/**
 * 権限マトリックス取得APIのレスポンス型
 */
export interface PermissionMatrixGetResponseType {
  matrix: PermissionMatrix<FinanceFeature>;
}

/**
 * 権限マトリックス更新APIのレスポンス型
 */
export interface PermissionMatrixUpdateResponseType {
  message: string;
}

// Disable caching for this route to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 認可サービスのインスタンス
 */
const authorizationService = new FinanceAuthorizationService();

/**
 * APIレスポンスオプション
 */
const options: APIResponseOptions = {
  rootFeature: ROOT_FEATURE,
  feature: FinanceFeature.PERMISSION_ADMIN,
};

/**
 * 権限マトリックス取得API
 */
export async function GET() {
  return await APIUtil.apiHandler(async () => {
    // 管理者権限チェック
    const isAdmin = await authorizationService.authorize(
      FinanceFeature.PERMISSION_ADMIN,
      PermissionLevel.ADMIN
    );

    if (!isAdmin) {
      throw new UnauthorizedError('Unauthorized');
    }

    // 権限マトリックスを取得
    const matrix = await PermissionMatrixService.getPermissionMatrix();

    const response: PermissionMatrixGetResponseType = { matrix };

    return response;
  }, options);
}

/**
 * 権限マトリックス更新API
 */
export async function PUT(request: NextRequest) {
  return await APIUtil.apiHandler(async () => {
    // 管理者権限チェック
    const isAdmin = await authorizationService.authorize(
      FinanceFeature.PERMISSION_ADMIN,
      PermissionLevel.ADMIN
    );

    if (!isAdmin) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body: PermissionMatrixUpdateRequestType = await request.json();
    const { matrix } = body;

    // 入力検証
    if (!matrix) {
      throw new BadRequestError('Matrix is required');
    }

    // 権限マトリックスを更新
    await PermissionMatrixService.updatePermissionMatrix(matrix);

    const response: PermissionMatrixUpdateResponseType = {
      message: 'Permission matrix updated successfully',
    };

    return response;
  }, options);
}
