import { Feature, PermissionLevel } from '@/types/AuthorizationTypes';

/**
 * 権限チェックAPIのリクエスト型
 */
export interface CheckPermissionRequestType {
  feature: Feature;
  level: PermissionLevel;
}

/**
 * 権限チェックAPIのレスポンス型
 */
export interface CheckPermissionResponseType {
  hasPermission: boolean;
}
