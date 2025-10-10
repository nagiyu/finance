import { FinanceRecordTypeBase } from '@finance/interfaces/record/FinanceRecordTypeBase';

/**
 * 認可システムの型定義
 */

/**
 * 機能（Feature）の定義
 * アプリケーション内の各機能を表す
 */
export enum Feature {
  EXCHANGE = 'exchange',                      // 取引所管理
  TICKER = 'ticker',                          // ティッカー管理
  MY_TICKER = 'myTicker',                     // 個人ティッカーリスト
  FINANCE_NOTIFICATION = 'financeNotification', // 通知設定
  STOCK_CHART = 'stockChart',                 // 株価チャート
  TARGET_PRICE = 'targetPrice',               // 目標価格計算
  PERMISSION_ADMIN = 'permissionAdmin',       // 権限管理（管理者専用）
}

/**
 * 権限レベル（Permission Level）の定義
 * 各機能に対する操作の種類を表す
 */
export enum PermissionLevel {
  NONE = 'none',       // アクセス不可
  VIEW = 'view',       // 閲覧のみ
  EDIT = 'edit',       // 編集可能（閲覧も含む）
  DELETE = 'delete',   // 削除可能（編集・閲覧も含む）
  ADMIN = 'admin',     // 管理者権限（すべての操作が可能）
}

/**
 * ユーザータイプ（User Type）の定義
 * システムを利用するユーザーのカテゴリを表す
 */
export enum UserType {
  GUEST = 'guest',                 // 未ログインユーザー
  AUTHENTICATED = 'authenticated', // ログイン済みユーザー
  PREMIUM = 'premium',             // プレミアムユーザー（将来的な拡張用）
  ADMIN = 'admin',                 // 管理者
}

/**
 * 権限マトリックスの型定義
 * 機能とユーザータイプの組み合わせで権限レベルを定義
 */
export type PermissionMatrix = {
  [feature in Feature]: {
    [userType in UserType]: PermissionLevel;
  };
};

/**
 * 権限マトリックスレコード
 * DynamoDBに保存される形式
 */
export interface PermissionMatrixRecord extends FinanceRecordTypeBase {
  Id: string;                    // 'PermissionMatrix'
  DataType: 'PermissionMatrix';  // 'PermissionMatrix'
  Matrix: PermissionMatrix;      // 権限マトリックスデータ
  Create: number;
  Update: number;
}

