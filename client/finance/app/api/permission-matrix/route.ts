import { NextRequest } from 'next/server';

import APIUtil from '@client-common/utils/APIUtil';

import AuthorizationService from '@/services/auth/AuthorizationService';
import PermissionMatrixService from '@/services/auth/PermissionMatrixService';
import { Feature, PermissionLevel, PermissionMatrix } from '@/types/AuthorizationTypes';

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

    return APIUtil.ReturnSuccessWithObject({ matrix });
  } catch (error) {
    console.error('Error getting permission matrix:', error);
    return APIUtil.ReturnInternalServerError();
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

    const body = await request.json();
    const { matrix } = body as { matrix: PermissionMatrix };

    // 入力検証
    if (!matrix) {
      return APIUtil.ReturnBadRequest('Matrix is required');
    }

    // 権限マトリックスを更新
    await PermissionMatrixService.updatePermissionMatrix(matrix);

    return APIUtil.ReturnSuccessWithObject({ message: 'Permission matrix updated successfully' });
  } catch (error) {
    console.error('Error updating permission matrix:', error);
    return APIUtil.ReturnInternalServerError();
  }
}
