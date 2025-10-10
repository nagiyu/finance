import { PermissionMatrix } from '@/types/AuthorizationTypes';

/**
 * 権限マトリックス更新APIのリクエスト型
 */
export interface PermissionMatrixUpdateRequestType {
  matrix: PermissionMatrix;
}
