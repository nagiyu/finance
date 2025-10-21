import { PermissionMatrix } from '@/types/AuthorizationTypes';

/**
 * 権限マトリックスデータ型
 * クライアント・サーバー間でやり取りするデータ形式
 */
export interface PermissionMatrixDataType {
  id: string;
  matrix: PermissionMatrix;
  create: number;
  update: number;
}
