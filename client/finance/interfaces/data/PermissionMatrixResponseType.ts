import { PermissionMatrix } from '@/types/AuthorizationTypes';

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
