import { NextRequest } from 'next/server';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import PermissionMatrixService from '@/services/auth/PermissionMatrixService';
import { Feature, PermissionLevel, PermissionMatrix } from '@/types/AuthorizationTypes';

/**
 * 権限マトリックス更新APIのリクエスト型
 */
export interface PermissionMatrixUpdateRequestType {
  matrix: PermissionMatrix;
}

/**
 * 権限マトリックス取得APIのレスポンス型
 */
export interface PermissionMatrixGetResponseType {
  matrix: PermissionMatrix;
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
 * 権限マトリックス取得API
 */
export async function GET() {
  try {
    // 管理者権限チェック
    const isAdmin = await AuthorizationService.authorize(
      Feature.PERMISSION_ADMIN,
      PermissionLevel.ADMIN
    );

    if (!isAdmin) {
      return APIUtil.ReturnUnauthorized();
    }

    // 権限マトリックスを取得
    const matrix = await PermissionMatrixService.getPermissionMatrix();

    const response: PermissionMatrixGetResponseType = { matrix };
    return APIUtil.ReturnSuccessWithObject(response);
  } catch (error) {
    console.error('Error getting permission matrix:', error);
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}

/**
 * 権限マトリックス更新API
 */
export async function PUT(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdmin = await AuthorizationService.authorize(
      Feature.PERMISSION_ADMIN,
      PermissionLevel.ADMIN
    );

    if (!isAdmin) {
      return APIUtil.ReturnUnauthorized();
    }

    const body: PermissionMatrixUpdateRequestType = await request.json();
    const { matrix } = body;

    // 入力検証
    if (!matrix) {
      return APIUtil.ReturnBadRequest('Matrix is required');
    }

    // 権限マトリックスを更新
    await PermissionMatrixService.updatePermissionMatrix(matrix);

    const response: PermissionMatrixUpdateResponseType = {
      message: 'Permission matrix updated successfully',
    };
    return APIUtil.ReturnSuccessWithObject(response);
  } catch (error) {
    console.error('Error updating permission matrix:', error);
    return APIUtil.ReturnInternalServerErrorWithError(error);
  }
}
