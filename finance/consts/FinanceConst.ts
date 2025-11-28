export const ROOT_FEATURE = 'Finance';

/**
 * Finance機能の定義
 * アプリケーション内の各機能を表す
 */
export enum FinanceFeature {
  EXCHANGE = 'exchange', // 取引所管理
  TICKER = 'ticker', // ティッカー管理
  MY_TICKER = 'myTicker', // 個人ティッカーリスト
  FINANCE_NOTIFICATION = 'financeNotification', // 通知設定
  STOCK_CHART = 'stockChart', // 株価チャート
  TARGET_PRICE = 'targetPrice', // 目標価格計算
  PERMISSION_ADMIN = 'permissionAdmin', // 権限管理（管理者専用）
}
